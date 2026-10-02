-- Restricciones de dominio del diccionario de datos (documento 05).
--
-- El diccionario define CHECK > 0 sobre las medidas morfométricas y el peso
-- estimado, y CHECK > 0 sobre la periodicidad de los planes sanitarios. El
-- generador del cliente no expresa estas restricciones, de modo que se
-- declaran aquí: la regla debe residir en la base y no solamente en la capa de
-- aplicación, para que ningún camino de escritura pueda eludirla.

ALTER TABLE "pesaje"
  ADD CONSTRAINT "pesaje_perimetro_toracico_positivo"
    CHECK ("perimetro_toracico" > 0),
  ADD CONSTRAINT "pesaje_largo_corporal_positivo"
    CHECK ("largo_corporal" > 0),
  ADD CONSTRAINT "pesaje_peso_estimado_positivo"
    CHECK ("peso_estimado" > 0),
  ADD CONSTRAINT "pesaje_constante_positiva"
    CHECK ("constante" > 0);

ALTER TABLE "plan_sanitario"
  ADD CONSTRAINT "plan_sanitario_periodicidad_positiva"
    CHECK ("periodicidad_dias" > 0);
