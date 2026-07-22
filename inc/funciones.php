<?php 
	require_once(__DIR__ . "/config.php");
	
	class toolSQL
	{
		function consoleLOG($data){echo '<script>console.log('. json_encode( $data ) .')</script>';}
		function dbConnect()
		{
			$sql = mysqli_connect(SERVER, USER, PASS, DB);
    			
			if ($sql) {
				mysqli_query ($sql,"SET NAMES 'utf8'");
				mysqli_set_charset($sql, "utf8");
			}
			
			return $sql; // Devuelve FALSE si falló la conexión
		}
		function dbDisconnect($sql)
		{
			$close = mysqli_close($sql);
			if(!$close)
				echo 'Ha ocurrido un error inexperado en la desconexión de la base de datos.';
			return $close;
		}
		function generalSQL($prepare)
		{

			/* Realiza la conexión*/
			$sql = $this->dbConnect();
			/* Se prepara la sentencia, retorna -1 ante un error || retorna array de resultados.*/
			if($stmt = $sql->prepare($prepare))
			{
				$stmt->execute();
				$result = $stmt->get_result();
				if($result)
					return -1;
				else
					return 1;
			}
		}
/*																															SELECT SQL */
		function selectSQL($prepare, $type, $params)
		{
			$prohibidas = '/\s*(DELETE|UPDATE|INSERT)\s*/i';

			if(preg_match($prohibidas, $prepare))
			{
				return [
					'error' => 401,
					'message' => 'Fallo en selectSQL: La consulta contiene sentencias prohibidas.' 
				];
			}

			/* Verifico que los tipos de datos coincidan con los parámetros*/
			$resultado = $this->typesVerify($params, $type);
			if (is_array($resultado) && isset($resultado['error'])) {
				return $resultado; // Retorna el error de verificación de tipos
			}
			
			$data = array();
			$sql = null;
			$stmt = null;

			try {
				// Validar conexión
				$sql = $this->dbConnect();
				if (!$sql) 
					throw new Exception("Error de conexión a la base de datos: " . mysqli_connect_error(), -1);

				if ($sql->connect_error) 
					throw new Exception("Error de conexión a la BD: " . $sql->connect_error, -1);
				
				// Preparar statement
				$stmt = $sql->prepare($prepare);
				if (!$stmt) 
					throw new Exception("Error al preparar la consulta: " . $sql->error, -2);
				
				// Vincular parámetros solo si hay tipos definidos
				if (!empty($type) && !empty($params)) {
					$a_params = array();
					$param_type = implode('', $type); 
					$a_params[] = &$param_type;
					
					for ($i = 0; $i < count($params); $i++) 
						$a_params[] = &$params[$i];
					
					call_user_func_array(array($stmt, 'bind_param'), $a_params);
				}

				// Ejecutar y validar
				if (!$stmt->execute()) 
					throw new Exception("Error al ejecutar la consulta: " . $stmt->error, -1);

				// Obtener resultados
				$result = $stmt->get_result();
				if (!$result) 
					throw new Exception("Error al obtener resultados: " . $stmt->error, -1);
			
				// Procesar resultados
				if ($result->num_rows > 0) {
					while ($row = $result->fetch_assoc()) 
						$data[] = $row;
					
					return $data;
				}
				return 0; // Sin resultados
			} 
			catch (Exception $e)
			{
				// Registro de error con más detalle
				$this->errorLog($prepare, $e->getMessage(), $e->getCode());
								
				// Devolver un array de error con el detalle
				return [
					'error' => $e->getCode() ?: -99,
					'message' => 'Fallo en selectSQL: ' . $e->getMessage()
				];
			}
			finally
			{
				// Cerrar statement y conexión
				if ($stmt) 
					$stmt->close();

				if ($sql) 
					$this->dbDisconnect($sql);
			}		
		}
/*																															INSERT SQL */
		function insertSQL($prepare, $type, $params, $user = "")
		{

			$prohibidas = '/\s*(DELETE|UPDATE|SELECT)\s*/i';

			if(preg_match($prohibidas, $prepare))
			{
				return [
					'error' => 401,
					'message' => 'Fallo en insertSQL: La consulta contiene sentencias prohibidas.' 
				];
			}

			if(count($params) != count($type))
			{
				return [
					'error' => 500,
					'message' => 'Fallo en insertSQL: La cantidad de parámetros no coincide con la cantidad de tipos de datos.' 
				];
			}

			/* Verifico que los tipos de datos coincidan con los parámetros*/
			$resultado = $this->typesVerify($params, $type);
			if (is_array($resultado) && isset($resultado['error'])) {
				return $resultado; // Retorna el error de verificación de tipos
			}
			
			$data = array();
			$sql = null;
			$stmt = null;

			try {
				// Validar conexión
				$sql = $this->dbConnect();
				if (!$sql) 
					throw new Exception("Error de conexión a la base de datos: " . mysqli_connect_error(), -1);

				if ($sql->connect_error) 
					throw new Exception("Error de conexión a la BD: " . $sql->connect_error, -1);
				
				// Preparar statement
				$stmt = $sql->prepare($prepare);
				if (!$stmt) 
					throw new Exception("Error al preparar la consulta: " . $sql->error, -2);
				
				// Vincular parámetros solo si hay tipos definidos
				if (!empty($type) && !empty($params)) {
					$a_params = array();
					$param_type = implode('', $type); 
					$a_params[] = &$param_type;
					
					for ($i = 0; $i < count($params); $i++) 
						$a_params[] = &$params[$i];

					call_user_func_array(array($stmt, 'bind_param'), $a_params);
				}

				// Ejecutar y validar
				if (!$stmt->execute()) 
					throw new Exception("Error al ejecutar la consulta: " . $stmt->error, -1);

				// Registrar insert exitoso
				$this->logSuccessfulInsert($prepare, $params, $stmt->insert_id, $user);
			
				return $stmt->insert_id;
			} 
			catch (Exception $e)
			{
				// Registro de error con más detalle
				$this->errorLog($prepare, $e->getMessage(), $e->getCode());
				
				// Detectar error de duplicado (código 1062)
				$errorMessage = $e->getMessage();
				if (strpos($errorMessage, 'Duplicate entry') !== false || $e->getCode() == 1062) {
					// Extraer el campo duplicado del mensaje de error
					// Formato típico: "Duplicate entry 'valor' for key 'nombre_campo'"
					preg_match("/Duplicate entry '(.+?)' for key '(.+?)'/", $errorMessage, $matches);
					
					$campo = isset($matches[2]) ? $matches[2] : 'desconocido';
					$valor = isset($matches[1]) ? $matches[1] : '';
					
					// Limpiar nombre del campo (quitar índices como tabla.PRIMARY o tabla.campo_UNIQUE)
					$campo = explode('_', preg_replace('/.*\./', '', $campo));
					
					return [
						'error' => 1062,
						'message' => "Valor duplicado para el campo: {$campo[1]}",
						'campo' => $campo,
						'valor' => $valor
					];
				}
				
				// Devolver un array de error con el detalle
				return [
					'error' => $e->getCode() ?: -99,
					'message' => 'Fallo en insertSQL: ' . $e->getMessage()
				];
			}
			finally
			{
				// Cerrar statement y conexión
				if ($stmt) 
					$stmt->close();

				if ($sql) 
					$this->dbDisconnect($sql);
			}		
		}
/*																															UPDATE SQL */
		function updateSQL($prepare, $type, $params, $user = "", $cambiosDetectados = [])
		{
			$prohibidas = '/\s*(DELETE|INSERT|SELECT)\s*/i';

			if(preg_match($prohibidas, $prepare))
			{
				return [
					'error' => 401,
					'message' => 'Fallo en selectSQL: La consulta contiene sentencias prohibidas.' 
				];
			}

			if(count($params) != count($type))
			{
				return [
					'error' => 500,
					'message' => 'Fallo en insertSQL: La cantidad de parámetros no coincide con la cantidad de tipos de datos.' 
				];
			}
			
			/* Verifico que los tipos de datos coincidan con los parámetros*/
			$resultado = $this->typesVerify($params, $type);
			if (is_array($resultado) && isset($resultado['error'])) {
				return $resultado; // Retorna el error de verificación de tipos
			}
			
			$data = array();
			$sql = null;
			$stmt = null;

			try {
				// Validar conexión
				$sql = $this->dbConnect();
				if (!$sql) 
					throw new Exception("Error de conexión a la base de datos: " . mysqli_connect_error(), -1);

				if ($sql->connect_error) 
					throw new Exception("Error de conexión a la BD: " . $sql->connect_error, -1);
				
				// Preparar statement
				$stmt = $sql->prepare($prepare);
				if (!$stmt) 
					throw new Exception("Error al preparar la consulta: " . $sql->error, -2);
				
				// Vincular parámetros solo si hay tipos definidos
				if (!empty($type) && !empty($params)) {
					$a_params = array();
					$param_type = implode('', $type); 
					$a_params[] = &$param_type;
					
					for ($i = 0; $i < count($params); $i++) 
						$a_params[] = &$params[$i];

					call_user_func_array(array($stmt, 'bind_param'), $a_params);
				}

			// Ejecutar y validar
			if (!$stmt->execute()) 
				throw new Exception("Error al ejecutar la consulta: " . $stmt->error, -1);

			// Registrar update exitoso
			if($stmt->affected_rows > 0)
			{
				// El ID es el último parámetro
				$recordId = end($params);
				$this->logSuccessfulUpdate($prepare, $cambiosDetectados, $user, $recordId);
			}

			return $stmt->affected_rows; // Resultado de la actualización
			} 
			catch (Exception $e)
			{
				// Registro de error con más detalle
				$this->errorLog($prepare, $e->getMessage(), $e->getCode());
				
				// Detectar error de duplicado (código 1062)
				$errorMessage = $e->getMessage();
				if (strpos($errorMessage, 'Duplicate entry') !== false || $e->getCode() == 1062) {
					// Extraer el campo duplicado del mensaje de error
					// Formato típico: "Duplicate entry 'valor' for key 'nombre_campo'"
					preg_match("/Duplicate entry '(.+?)' for key '(.+?)'/", $errorMessage, $matches);
					
					$campo = isset($matches[2]) ? $matches[2] : 'desconocido';
					$valor = isset($matches[1]) ? $matches[1] : '';
					
					// Limpiar nombre del campo (quitar índices como tabla.PRIMARY o tabla.campo_UNIQUE)
					$campo = explode('_', preg_replace('/.*\./', '', $campo));
					
					return [
						'error' => 1062,
						'message' => "Valor duplicado para el campo: {$campo[1]}",
						'campo' => $campo,
						'valor' => $valor
					];
				}
				
				// Devolver un array de error con el detalle
				return [
					'error' => $e->getCode() ?: -99,
					'message' => 'Fallo en updateSQL: ' . $e->getMessage()
				];
			}
			finally
			{
				// Cerrar statement y conexión
				if ($stmt) 
					$stmt->close();

				if ($sql) 
					$this->dbDisconnect($sql);
			}		
		}
/*																															DELETE SQL */	
	
		function deleteSQL($prepare, $type, $params, $user = "")
		{
			$prohibidas = '/\s*(UPDATE|INSERT|SELECT)\s*/i';

			if(preg_match($prohibidas, $prepare))
			{
				return [
					'error' => 401,
					'message' => 'Fallo en selectSQL: La consulta contiene sentencias prohibidas.' 
				];
			}

			if(count($params) != count($type))
			{
				return [
					'error' => 500,
					'message' => 'Fallo en insertSQL: La cantidad de parámetros no coincide con la cantidad de tipos de datos.' 
				];
			}
			
			/* Verifico que los tipos de datos coincidan con los parámetros*/
			$resultado = $this->typesVerify($params, $type);
			if (is_array($resultado) && isset($resultado['error'])) {
				return $resultado; // Retorna el error de verificación de tipos
			}
			
			$data = array();
			$sql = null;
			$stmt = null;

			try {
				// Validar conexión
				$sql = $this->dbConnect();
				if (!$sql) 
					throw new Exception("Error de conexión a la base de datos: " . mysqli_connect_error(), -1);

				if ($sql->connect_error) 
					throw new Exception("Error de conexión a la BD: " . $sql->connect_error, -1);
				
				// Preparar statement
				$stmt = $sql->prepare($prepare);
				if (!$stmt) 
					throw new Exception("Error al preparar la consulta: " . $sql->error, -2);
				
				// Vincular parámetros solo si hay tipos definidos
				if (!empty($type) && !empty($params)) {
					$a_params = array();
					$param_type = implode('', $type); 
					$a_params[] = &$param_type;
					
					for ($i = 0; $i < count($params); $i++) 
						$a_params[] = &$params[$i];

					call_user_func_array(array($stmt, 'bind_param'), $a_params);
				}

			// Ejecutar y validar
			if (!$stmt->execute()) 
				throw new Exception("Error al ejecutar la consulta: " . $stmt->error, -1);
			
			// Registrar delete exitoso
			if($stmt->affected_rows > 0)
			{
				// El ID es el primer (y generalmente único) parámetro
				if(count($params) == 1)
					$recordId = $params[0];
				else
				{
					$recordId = implode(", ", $params);
				}
				
				$this->logSuccessfulDelete($prepare, $user, $recordId);
			}

			return $stmt->affected_rows; // Resultado de la actualización
		} 
		catch (Exception $e)
		{
			// Registro de error con más detalle
			$this->errorLog($prepare, $e->getMessage(), $e->getCode());				// Devolver un array de error con el detalle
				return [
					'error' => $e->getCode() ?: -99,
					'message' => 'Fallo en deleteSQL: ' . $e->getMessage()
				];
			}
			finally
			{
				// Cerrar statement y conexión
				if ($stmt) 
					$stmt->close();

				if ($sql) 
					$this->dbDisconnect($sql);
			}		
		}

		function typesVerify($params, $types)
		{
			// Verifica que el número de parámetros y tipos coincida
			if (count($params) !== count($types)) 
				return ['error' => 500, 'message' => 'La cantidad de tipos de datos no coinciden con la cantidad de parámetros.'];
			
			foreach ($params as $key => $value)
			{
				$tipo_real_letra = strtolower(gettype($value)[0]);
				$tipo_esperado_letra = strtolower($types[$key]);
				if ($tipo_real_letra != $tipo_esperado_letra)
					return ['error' => 500, 'message' => 'Tipo de dato incorrecto en el valor: ' . ($params[$key]) . ' [Index: '.$key.']' . '. Se estableció ' . $tipo_esperado_letra . ' se recibió ' . $tipo_real_letra . '.'];
			}
			return 1;
		}

		function errorLog($query, $error, $code = 0)
		{
			$logDir = __DIR__ . '/../logs';
			
			// Crear directorio si no existe
			if (!is_dir($logDir)) {
				mkdir($logDir, 0755, true);
			}
			
			$logFile = $logDir . '/query_error.log';
			$file = fopen($logFile, 'a');
			
			if ($file) {
				$codeStr = $code ? "[Code: $code] " : '';
				fwrite($file, "[" . date("r") . "] " . $codeStr . "[$error] \n[$query]\r\n\n");
				fclose($file);
			}
		}
/*																															LOG INSERT */
		function logSuccessfulInsert($query, $params, $insertId, $user)
		{
			$logFile = __DIR__ . '/../logs/consultas.log';
			
			// Extraer nombre de la tabla de la consulta INSERT
			if (preg_match('/INSERT\s+INTO\s+`?(\w+)`?/i', $query, $matches)) {
				$tabla = $matches[1];
			} else {
				$tabla = 'unknown';
			}
			
			// Extraer los nombres de las columnas
			if (preg_match('/\(([^)]+)\)\s*VALUES/i', $query, $matches)) {
				$columnas = array_map('trim', explode(',', str_replace('`', '', $matches[1])));
			} else {
				$columnas = [];
			}
			
			// Procesar valores: omitir campos sensibles
			$valoresProcesados = [$insertId]; // El insert_id es el primer valor
			foreach ($columnas as $index => $columna) {
				// Eliminar prefix (texto antes del primer _)
				$campoSinPrefijo = preg_replace('/^\w+_/', '', $columna);
				
				// Omitir campos password y modificado
				if (stripos($campoSinPrefijo, 'password') !== false || stripos($campoSinPrefijo, 'modificado') !== false || stripos($columna, 'usr_codigo') !== false) {
					continue;
				}
				
				// Obtener el valor correspondiente
				$valor = isset($params[$index]) ? $params[$index] : 'NULL';
				
				// Formatear el valor (truncar si es muy largo)
				if (is_string($valor) && strlen($valor) > 100) {
					$valor = substr($valor, 0, 100) . '...';
				}
				
				$valoresProcesados[] = $valor;
			}
			
			// Preparar la línea de log
			$ip = $this->getIP();
			$fecha = date('Y-m-d H:i:s');
			$valores = json_encode($valoresProcesados, JSON_UNESCAPED_UNICODE);
			
			$logLine = "[{$user}:{$ip} {$fecha}] insert {$tabla} {$valores}\n";
			
			// Escribir en el archivo
			$file = fopen($logFile, 'a');
			if ($file) {
				fwrite($file, $logLine);
				fclose($file);
			}
		}
/*																															LOG UPDATE */
		function logSuccessfulUpdate($query, $cambiosDetectados, $user, $recordId = 0)
		{
			$logFile = __DIR__ . '/../logs/consultas.log';
			
			// Extraer nombre de la tabla de la consulta UPDATE
			if (preg_match('/UPDATE\s+`?(\w+)`?/i', $query, $matches)) {
				$tabla = $matches[1];
			} else {
				$tabla = 'unknown';
			}
			
		// Procesar valores de cambios: solo valores nuevos, omitir campos sensibles
		// Incluir el ID como primer elemento
		$valoresProcesados = [$recordId];
		
		foreach ($cambiosDetectados as $cambio) {
			// Verificar si es un cambio de password
			if (isset($cambio['campo']) && stripos($cambio['campo'], 'password') !== false) {
				$valoresProcesados[] = 'Cambio contraseña';
			} else {
				// Obtener valores anterior y nuevo
				$valorAnterior = isset($cambio['anterior']) ? $cambio['anterior'] : 'NULL';
				$valorNuevo = isset($cambio['nuevo']) ? $cambio['nuevo'] : 'NULL';
				
				// Formatear los valores (truncar si son muy largos)
				if (is_string($valorAnterior) && strlen($valorAnterior) > 50) {
					$valorAnterior = substr($valorAnterior, 0, 50) . '...';
				}
				if (is_string($valorNuevo) && strlen($valorNuevo) > 50) {
					$valorNuevo = substr($valorNuevo, 0, 50) . '...';
				}
				
				$valoresProcesados[] = $valorAnterior . '->' . $valorNuevo;
			}
		}
		
		// Preparar la línea de log
		$ip = $this->getIP();
		$fecha = date('Y-m-d H:i:s');
		$valores = json_encode($valoresProcesados, JSON_UNESCAPED_UNICODE);
		
		$logLine = "[{$user}:{$ip} {$fecha}] update {$tabla} {$valores}\n";			// Escribir en el archivo
			$file = fopen($logFile, 'a');
			if ($file) {
				fwrite($file, $logLine);
				fclose($file);
			}
		}
/*																															LOG DELETE */
		function logSuccessfulDelete($query, $user, $recordId = 0)
		{
			$logFile = __DIR__ . '/../logs/consultas.log';
			
			// Extraer nombre de la tabla de la consulta DELETE
			if (preg_match('/DELETE\s+FROM\s+`?(\w+)`?/i', $query, $matches)) {
				$tabla = $matches[1];
			} else {
				$tabla = 'unknown';
			}
			
			// Preparar la línea de log
			$ip = $this->getIP();
			$fecha = date('Y-m-d H:i:s');
			$valores = json_encode([$recordId], JSON_UNESCAPED_UNICODE);
			
			$logLine = "[{$user}:{$ip} {$fecha}] delete {$tabla} {$valores}\n";
			
			// Escribir en el archivo
			$file = fopen($logFile, 'a');
			if ($file) {
				fwrite($file, $logLine);
				fclose($file);
			}
		}

		function getIP()
		{
			if (isset($_SERVER["HTTP_CLIENT_IP"]))
				return $_SERVER["HTTP_CLIENT_IP"];
			elseif (isset($_SERVER["HTTP_X_FORWARDED_FOR"]))
				return $_SERVER["HTTP_X_FORWARDED_FOR"];
			elseif (isset($_SERVER["HTTP_X_FORWARDED"]))
				return $_SERVER["HTTP_X_FORWARDED"];
			elseif (isset($_SERVER["HTTP_FORWARDED_FOR"]))
				return $_SERVER["HTTP_FORWARDED_FOR"];
			elseif (isset($_SERVER["HTTP_FORWARDED"]))
				return $_SERVER["HTTP_FORWARDED"];
			else
				return $_SERVER["REMOTE_ADDR"];
		}
		function generarSlug($cadena)
		{
		    $cadena = str_replace(
		        array('á', 'à', 'ä', 'â', 'ª', 'Á', 'À', 'Â', 'Ä'),
		        array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'),
		        $cadena);

		    $cadena = str_replace(
		        array('é', 'è', 'ë', 'ê', 'É', 'È', 'Ê', 'Ë'),
		        array('e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'),
		        $cadena);

		    $cadena = str_replace(
		        array('í', 'ì', 'ï', 'î', 'Í', 'Ì', 'Ï', 'Î'),
		        array('i', 'i', 'i', 'i', 'i', 'i', 'i', 'i'),
		        $cadena);

		    $cadena = str_replace(
		        array('ó', 'ò', 'ö', 'ô', 'Ó', 'Ò', 'Ö', 'Ô'),
		        array('o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'),
		        $cadena);

		    $cadena = str_replace(
		        array('ú', 'ù', 'ü', 'û', 'Ú', 'Ù', 'Û', 'Ü'),
		        array('u', 'u', 'u', 'u', 'u', 'u', 'u', 'u'),
		        $cadena);

		    $cadena = str_replace(
		        array('ñ', 'Ñ', 'ç', 'Ç', ' ', '"', "'", ',', '.','%'),
		        array('n', 'n', 'c', 'c', '-', '', '', '', '','<'),
		        $cadena);

		    $cadena = strtolower($cadena);
   			return $cadena;
		}
		function generarSlugDB($cadena)
		{
			$cadena = str_replace(" de", "", $cadena);

		    $cadena = str_replace(
		        array('á', 'à', 'ä', 'â', 'ª', 'Á', 'À', 'Â', 'Ä'),
		        array('a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'),
		        $cadena);

		    $cadena = str_replace(
		        array('é', 'è', 'ë', 'ê', 'É', 'È', 'Ê', 'Ë'),
		        array('e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'),
		        $cadena);

		    $cadena = str_replace(
		        array('í', 'ì', 'ï', 'î', 'Í', 'Ì', 'Ï', 'Î'),
		        array('i', 'i', 'i', 'i', 'i', 'i', 'i', 'i'),
		        $cadena);

		    $cadena = str_replace(
		        array('ó', 'ò', 'ö', 'ô', 'Ó', 'Ò', 'Ö', 'Ô'),
		        array('o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'),
		        $cadena);

		    $cadena = str_replace(
		        array('ú', 'ù', 'ü', 'û', 'Ú', 'Ù', 'Û', 'Ü'),
		        array('u', 'u', 'u', 'u', 'u', 'u', 'u', 'u'),
		        $cadena);

		    $cadena = str_replace(
		        array('ñ', 'Ñ', 'ç', 'Ç', ' ', '"', "'", ',', '.','%'),
		        array('n', 'n', 'c', 'c', '_', '', '', '', '','<'),
		        $cadena);

		    $cadena = strtolower($cadena);
   			return $cadena;
		}
	}
	
    class tools
	{
		function agregarComillas($cadena)
		{
			//convertimos en array
			$cadenas = explode(",", $cadena);
			//Recorremos el array y le agregamos las comillas
			$cadenaA = [];
			foreach($cadenas as $key => $value)
				array_push($cadenaA, "'{$value}'");
			$cadena = implode(",", $cadenaA);
			return $cadena;
		}
		function getCode($length = 10)
		{
			$code = '';
			$pattern = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';
			$max = strlen($pattern)-1;
			for($i=0;$i < $length ;$i++) 
				$code .= $pattern[mt_rand(0,$max)];
			return $code;
		}
		function gestionarArchivo($prefijo, $complemento, $datos, $archivos, $ruta, $accion, $permitidos)
		{	
			if(!isset($datos["{$prefijo}_{$complemento}_control"]))
				$datos["{$prefijo}_{$complemento}_control"] = "";

			if(!isset($datos["{$prefijo}_{$complemento}_borrar"]))
				$datos["{$prefijo}_{$complemento}_borrar"] = "";

			$dato_control = $datos["{$prefijo}_{$complemento}_control"];
			$dato_borrar = $datos["{$prefijo}_{$complemento}_borrar"];
			$dato_archivo = "{$prefijo}_{$complemento}";
			//Si el directorio no existe, lo creamos
			if (!is_dir($ruta)){mkdir($ruta, 0777, true);}
			
			if($accion == 'crear' || $accion == 'masivo')
			{	//Validamos si viene un archivo
				if($_FILES["{$dato_archivo}"]["name"] != "")
				{	//Obtener la extensión del archivo
					$extension = pathinfo($_FILES["{$dato_archivo}"]["name"], PATHINFO_EXTENSION);
					$extension = strtolower($extension);
					//Validamos si la extensión es permitida
					if (in_array($extension, $permitidos))
					{	//Generamos un nombre único para la imagen y lo movemos
						$imagen = $this->getCode(10).".".$extension;
						move_uploaded_file($_FILES["{$dato_archivo}"]['tmp_name'], "{$ruta}/{$imagen}");
						return $imagen;
					}
					else
					{	//Retornamos error de tipo no permitido
						return [
							'error' => 415,
							'message' => 'Tipo de archivo no permitido. Tipos permitidos: ' . implode(", ", $permitidos)
						];
					}
				}
				else //Retornamos vacío
					return "";
			}
			else
			if($accion == 'editar' || $accion == 'estados')
			{
				//Validamos si suben un archivo
				if($_FILES["{$dato_archivo}"]["name"] != "")
				{	//Obtener la extensión del archivo
					$extension = pathinfo($_FILES["{$dato_archivo}"]["name"], PATHINFO_EXTENSION);
					$extension = strtolower($extension);
					//Validamos si la extensión es permitida
					if (in_array($extension, $permitidos))
					{	//Eliminamos la imagen anterior si existe
										
						if("{$dato_borrar}" != "")
							if(file_exists("{$ruta}/{$dato_borrar}"))
								unlink("{$ruta}/{$dato_borrar}");
						
						//Generamos un nombre único para la imagen y lo movemos
						$imagen = $this->getCode(20).".".$extension;
						move_uploaded_file($_FILES["{$dato_archivo}"]['tmp_name'], "{$ruta}/{$imagen}");
						return $imagen;
					}
					else
					{	//Retornamos error de tipo no permitido
						return [
							'error' => 415,
							'message' => 'Tipo de archivo no permitido. Tipos permitidos: ' . implode(", ", $permitidos)
						];
					}
				}
				else
				{	//Si no llega un valor en control, es porque la imagen se eliminó
					if($dato_control == "" && $dato_borrar != "")
					{	//Eliminamos la imagen anterior si existe
						if(file_exists("{$ruta}/{$dato_borrar}"))
							unlink("{$ruta}/{$dato_borrar}");
						return "";
					}
					else
					{	//Retornamos el valor que ya estaba
						return $dato_control;
					}
				}
			}
		}

		function gestionarArchivoSinPrefijo($complemento, $datos, $archivos, $ruta, $accion, $permitidos)
		{	
			if(!isset($datos["{$complemento}_control"]))
				$datos["{$complemento}_control"] = "";

			if(!isset($datos["{$complemento}_borrar"]))
				$datos["{$complemento}_borrar"] = "";

			$dato_control = $datos["{$complemento}_control"];
			$dato_borrar = $datos["{$complemento}_borrar"];
			$dato_archivo = "{$complemento}";

			
			//Si el directorio no existe, lo creamos
			if (!is_dir($ruta)){mkdir($ruta, 0777, true);}
			
			if($accion == 'crear' || $accion == 'masivo')
			{	//Validamos si viene un archivo
				if($_FILES["{$dato_archivo}"]["name"] != "")
				{	//Obtener la extensión del archivo
					$extension = pathinfo($_FILES["{$dato_archivo}"]["name"], PATHINFO_EXTENSION);
					$extension = strtolower($extension);
					//Validamos si la extensión es permitida
					if (in_array($extension, $permitidos))
					{	//Generamos un nombre único para la imagen y lo movemos
						$imagen = $this->getCode(10).".".$extension;
						move_uploaded_file($_FILES["{$dato_archivo}"]['tmp_name'], "{$ruta}/{$imagen}");
						return $imagen;
					}
					else
					{	//Retornamos error de tipo no permitido
						return [
							'error' => 415,
							'message' => 'Tipo de archivo no permitido. Tipos permitidos: ' . implode(", ", $permitidos)
						];
					}
				}
				else //Retornamos vacío
					return "";
			}
			else
			if($accion == 'editar' || $accion == 'estados')
			{
				//Validamos si suben un archivo
				if($_FILES["{$dato_archivo}"]["name"] != "")
				{	//Obtener la extensión del archivo
					$extension = pathinfo($_FILES["{$dato_archivo}"]["name"], PATHINFO_EXTENSION);
					$extension = strtolower($extension);
					//Validamos si la extensión es permitida
					if (in_array($extension, $permitidos))
					{	//Eliminamos la imagen anterior si existe
										
						if("{$dato_borrar}" != "")
							if(file_exists("{$ruta}/{$dato_borrar}"))
								unlink("{$ruta}/{$dato_borrar}");
						
						//Generamos un nombre único para la imagen y lo movemos
						$imagen = $this->getCode(20).".".$extension;
						move_uploaded_file($_FILES["{$dato_archivo}"]['tmp_name'], "{$ruta}/{$imagen}");
						return $imagen;
					}
					else
					{	//Retornamos error de tipo no permitido
						return [
							'error' => 415,
							'message' => 'Tipo de archivo no permitido. Tipos permitidos: ' . implode(", ", $permitidos)
						];
					}
				}
				else
				{	//Si no llega un valor en control, es porque la imagen se eliminó
					if($dato_control == "" && $dato_borrar != "")
					{	//Eliminamos la imagen anterior si existe
						if(file_exists("{$ruta}/{$dato_borrar}"))
							unlink("{$ruta}/{$dato_borrar}");
						return "";
					}
					else
					{	//Retornamos el valor que ya estaba
						return $dato_control;
					}
				}
			}
		}
		function formatearFecha($fecha, $formato = 'ymdh', $abreviado = false)
		{
			$map = [
				'ymd'  => $abreviado ? 'dd MMM y' : "d 'de' MMMM 'de' y",
				'dmy'  => $abreviado ? 'dd MMM y' : "d 'de' MMMM 'de' y",
				'mdy'  => $abreviado ? 'MMM dd, y' : "MMMM dd 'de' y",
				'ymdh' => $abreviado ? "dd MMM y HH:mm" : "d 'de' MMMM 'de' y 'a las' HH:mm",
				'dmyh' => $abreviado ? "dd MMM y HH:mm" : "d 'de' MMMM 'de' y 'a las' HH:mm",
				'mdyh' => $abreviado ? "MMM dd, y HH:mm" : "MMMM dd 'de' y 'a las' HH:mm",
			];

			if (!isset($map[$formato])) return 'Sin establecer';

			$dt = new DateTime($fecha);
			$fmt = new IntlDateFormatter(
				'es_ES',
				IntlDateFormatter::NONE,
				IntlDateFormatter::NONE,
				$dt->getTimezone()->getName(),
				IntlDateFormatter::GREGORIAN,
				$map[$formato]
			);
			return $fmt->format($dt);
		}
	}	
?>