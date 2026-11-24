# Validación manual de ClientFlow

Los recorridos de integración están pendientes. Ejecutarlos requiere las migraciones aplicadas, la implementación de Fase 3 y dos cuentas confirmadas. Consulta las pruebas automatizadas ejecutadas y sus estados en [TEST_REPORT.md](TEST_REPORT.md).

1. Ejecuta `npm.cmd run dev` y abre http://localhost:3000.
2. Entra con la cuenta A y anota las métricas iniciales del dashboard.
3. Crea un cliente ficticio, búscalo por nombre o empresa, edítalo y abre su ficha.
4. Crea una oportunidad asociada al cliente. Comprueba importe, fecha y etapa en su ficha y en el listado.
5. Mueve la oportunidad a otra etapa desde el pipeline usando el teclado. Consulta el dashboard y verifica que cambien las métricas que corresponden a la nueva etapa.
6. Recarga el navegador. Verifica que cliente, oportunidad, vínculo y etapa conservan el último estado guardado.
7. Intenta eliminar el cliente vinculado. Comprueba el mensaje y recarga para confirmar que los dos registros siguen presentes.
8. Guarda la URL de la ficha, cierra sesión y vuelve a abrirla. Comprueba la redirección al login.
9. Entra con la cuenta B y repite la visita a la ficha. Comprueba que la aplicación no muestra los datos de A. Verifica además el aislamiento en el listado, el selector de clientes, el pipeline y el dashboard.
10. Revisa el funcionamiento con teclado y la presentación a 375, 768 y 1280 px. Registra resultados y errores de consola sin exponer credenciales.
