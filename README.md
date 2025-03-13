# Practica-8-y-9-STR
Este repositorio contiene el proyecto en el cual se aplica lo concerniente a la Practica 8 sobre "Agregar Excepciones" al proyecto y sobre la practica 9 "De aplicar métodos recursivos y aplicar la concurrencia al proyecto" de la materia Ingenieria de Software en Tiempo real.

# Aplicacion de la recursividad y programacion concurrente
La recursividad se usa en la función obtenerMensajesRecursivamente, que recupera mensajes de la base de datos por grupo de manera eficiente.

En nuestro proyecto, aplicamos recursividad en la función obtenerMensajesRecursivamente, que nos permite recuperar mensajes de la base de datos en lotes pequeños en lugar de hacer una sola consulta grande que sobrecargue el servidor. Esta función se llama a sí misma de manera repetitiva, obteniendo cada vez un lote de mensajes hasta que no haya más datos por recuperar. 

Con esto, resolvimos el problema de que necesitabamos obtener los mensajes anteriores almacenados en la base de datos, pero mientras mas mensajes teniamos en dicha tabla, mas pesada seria la consulta, por tanto se implemento el metodo recursivo "obtenerMensajesRecursivamente", que recupera mensajes por lotes sin tener que hacer una sola consulta pesada.

Por otro lado, implementamos concurrencia mediante un Mutex, que evita que múltiples usuarios guarden mensajes al mismo tiempo en la base de datos y generen errores de escritura simultánea. Esto se logra bloqueando el acceso a la base de datos mientras un mensaje está siendo guardado y liberándolo una vez finalizado el proceso. De esta forma, aseguramos que los mensajes se almacenen correctamente sin pérdida de datos o inconsistencias, garantizando un sistema de mensajería en tiempo real más estable y confiable.

Ademas, el uso de async y await también forma parte de la programación concurrente, ya que permite manejar operaciones asíncronas sin bloquear el hilo principal. En nuestro código, async y await lo utilizamos en varios lugares, como en la conexión a la base de datos y la obtención y almacenamiento de los mensajes, esto para que una tarea no afecte la otra.


