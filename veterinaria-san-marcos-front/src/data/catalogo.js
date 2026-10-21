const medicamentos = [
  { codigo: 'ME001', categoria: 'Antibióticos', nombre: 'Amoxibay 250mg', principioActivo: 'Amoxicilina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 45, precio: 4200 },
  { codigo: 'ME002', categoria: 'Antibióticos', nombre: 'Amoxibay 500mg', principioActivo: 'Amoxicilina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 30, precio: 6500 },
  { codigo: 'ME003', categoria: 'Antibióticos', nombre: 'Enrofloxacina 50mg', principioActivo: 'Enrofloxacina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 25, precio: 5500 },
  { codigo: 'ME004', categoria: 'Antibióticos', nombre: 'Doxiciclina 100mg', principioActivo: 'Doxiciclina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 20, precio: 7000 },
  { codigo: 'ME005', categoria: 'Antiinflamatorios', nombre: 'Meloxicam 1mg', principioActivo: 'Meloxicam', presentacion: 'Caja 10 comp.', especie: 'Perro / Gato', stock: 35, precio: 4800 },
  { codigo: 'ME006', categoria: 'Antiinflamatorios', nombre: 'Carprofeno 25mg', principioActivo: 'Carprofeno', presentacion: 'Caja 10 comp.', especie: 'Perro', stock: 20, precio: 6200 },
  { codigo: 'ME007', categoria: 'Antiinflamatorios', nombre: 'Prednisona 5mg', principioActivo: 'Prednisona', presentacion: 'Caja 10 comp.', especie: 'Perro / Gato', stock: 30, precio: 3500 },
  { codigo: 'ME008', categoria: 'Antiparasitarios', nombre: 'Antiparasitario interno', principioActivo: 'Combinación antiparasitaria', presentacion: 'Comprimido', especie: 'Perro', stock: 40, precio: 2500 },
  { codigo: 'ME009', categoria: 'Antiparasitarios', nombre: 'Antiparasitario felino', principioActivo: 'Combinación antiparasitaria', presentacion: 'Comprimido', especie: 'Gato', stock: 35, precio: 2800 },
  { codigo: 'ME010', categoria: 'Antiparasitarios', nombre: 'Pipeta antipulgas', principioActivo: 'Antiparasitario tópico', presentacion: 'Pipeta individual', especie: 'Perro', stock: 28, precio: 4500 },
  { codigo: 'ME011', categoria: 'Antiparasitarios', nombre: 'Pipeta felina', principioActivo: 'Antiparasitario tópico', presentacion: 'Pipeta individual', especie: 'Gato', stock: 24, precio: 4200 },
  { codigo: 'ME012', categoria: 'Dermatológicos', nombre: 'Shampoo medicado', principioActivo: 'Fórmula dermatológica', presentacion: 'Frasco 250 ml', especie: 'Perro / Gato', stock: 18, precio: 8500 },
  { codigo: 'ME013', categoria: 'Dermatológicos', nombre: 'Crema dermatológica', principioActivo: 'Fórmula tópica', presentacion: 'Tubo 30 g', especie: 'Perro / Gato', stock: 15, precio: 5900 },
  { codigo: 'ME014', categoria: 'Digestivos', nombre: 'Probiótico veterinario', principioActivo: 'Probióticos', presentacion: 'Sobre individual', especie: 'Perro / Gato', stock: 22, precio: 3200 },
  { codigo: 'ME015', categoria: 'Digestivos', nombre: 'Protector gástrico', principioActivo: 'Omeprazol', presentacion: 'Caja 10 comp.', especie: 'Perro / Gato', stock: 20, precio: 4000 },
  { codigo: 'ME016', categoria: 'Vitaminas', nombre: 'Multivitamínico canino', principioActivo: 'Complejo vitamínico', presentacion: 'Frasco 60 ml', especie: 'Perro', stock: 16, precio: 7500 },
  { codigo: 'ME017', categoria: 'Vitaminas', nombre: 'Multivitamínico felino', principioActivo: 'Complejo vitamínico', presentacion: 'Frasco 60 ml', especie: 'Gato', stock: 14, precio: 7200 },
  { codigo: 'ME018', categoria: 'Oftalmológicos', nombre: 'Solución oftálmica', principioActivo: 'Solución veterinaria', presentacion: 'Frasco 10 ml', especie: 'Perro / Gato', stock: 12, precio: 5600 },
  { codigo: 'ME019', categoria: 'Otológicos', nombre: 'Limpiador ótico', principioActivo: 'Solución limpiadora', presentacion: 'Frasco 100 ml', especie: 'Perro / Gato', stock: 17, precio: 4900 },
  { codigo: 'ME020', categoria: 'Analgésicos', nombre: 'Analgésico veterinario', principioActivo: 'Uso veterinario', presentacion: 'Caja 10 comp.', especie: 'Perro', stock: 18, precio: 5200 },
  { codigo: 'ME021', categoria: 'Suplementos', nombre: 'Suplemento articular', principioActivo: 'Glucosamina y condroitina', presentacion: 'Frasco 30 comp.', especie: 'Perro', stock: 10, precio: 9500 },
  { codigo: 'ME022', categoria: 'Suplementos', nombre: 'Suplemento nutricional', principioActivo: 'Fórmula nutricional', presentacion: 'Frasco 100 ml', especie: 'Perro / Gato', stock: 12, precio: 6800 },
].map((producto) => ({
  ...producto,
  tipo: 'producto',
  id: producto.codigo,
}))

const servicios = [
  { codigo: 'SV001', categoria: 'Consultas', nombre: 'Consulta general', especie: 'Perro / Gato', duracion: '30 min', precio: 15000, observaciones: '' },
  { codigo: 'SV002', categoria: 'Consultas', nombre: 'Consulta de urgencia', especie: 'Perro / Gato', duracion: '45 min', precio: 25000, observaciones: '' },
  { codigo: 'SV003', categoria: 'Consultas', nombre: 'Consulta de control', especie: 'Perro / Gato', duracion: '20 min', precio: 10000, observaciones: '' },
  { codigo: 'SV004', categoria: 'Vacunación', nombre: 'Vacuna antirrábica', especie: 'Perro / Gato', duracion: '15 min', precio: 12000, observaciones: '' },
  { codigo: 'SV005', categoria: 'Vacunación', nombre: 'Vacuna óctuple', especie: 'Perro', duracion: '15 min', precio: 18000, observaciones: '' },
  { codigo: 'SV006', categoria: 'Vacunación', nombre: 'Vacuna triple felina', especie: 'Gato', duracion: '15 min', precio: 16000, observaciones: '' },
  { codigo: 'SV007', categoria: 'Vacunación', nombre: 'Vacuna KC', especie: 'Perro', duracion: '15 min', precio: 15000, observaciones: '' },
  { codigo: 'SV008', categoria: 'Desparasitación', nombre: 'Desparasitación interna', especie: 'Perro', duracion: '15 min', precio: 8000, observaciones: '' },
  { codigo: 'SV009', categoria: 'Desparasitación', nombre: 'Desparasitación felina', especie: 'Gato', duracion: '15 min', precio: 8000, observaciones: '' },
  { codigo: 'SV010', categoria: 'Desparasitación', nombre: 'Desparasitación externa', especie: 'Perro / Gato', duracion: '15 min', precio: 10000, observaciones: '' },
  { codigo: 'SV011', categoria: 'Procedimientos', nombre: 'Corte de uñas', especie: 'Perro / Gato', duracion: '15 min', precio: 5000, observaciones: '' },
  { codigo: 'SV012', categoria: 'Procedimientos', nombre: 'Limpieza de oídos', especie: 'Perro / Gato', duracion: '20 min', precio: 7000, observaciones: '' },
  { codigo: 'SV013', categoria: 'Procedimientos', nombre: 'Curación simple', especie: 'Perro / Gato', duracion: '20 min', precio: 9000, observaciones: '' },
  { codigo: 'SV014', categoria: 'Procedimientos', nombre: 'Retiro de puntos', especie: 'Perro / Gato', duracion: '20 min', precio: 10000, observaciones: '' },
  { codigo: 'SV015', categoria: 'Exámenes', nombre: 'Hemograma', especie: 'Perro / Gato', duracion: '30 min', precio: 18000, observaciones: '' },
  { codigo: 'SV016', categoria: 'Exámenes', nombre: 'Perfil bioquímico', especie: 'Perro / Gato', duracion: '30 min', precio: 25000, observaciones: '' },
  { codigo: 'SV017', categoria: 'Exámenes', nombre: 'Examen de orina', especie: 'Perro / Gato', duracion: '30 min', precio: 12000, observaciones: '' },
  { codigo: 'SV018', categoria: 'Exámenes', nombre: 'Examen coproparasitario', especie: 'Perro / Gato', duracion: '30 min', precio: 10000, observaciones: '' },
  { codigo: 'SV019', categoria: 'Imagenología', nombre: 'Radiografía simple', especie: 'Perro / Gato', duracion: '30 min', precio: 30000, observaciones: '' },
  { codigo: 'SV020', categoria: 'Imagenología', nombre: 'Ecografía abdominal', especie: 'Perro / Gato', duracion: '45 min', precio: 35000, observaciones: '' },
  { codigo: 'SV021', categoria: 'Peluquería', nombre: 'Baño sanitario', especie: 'Perro', duracion: '60 min', precio: 18000, observaciones: '' },
  { codigo: 'SV022', categoria: 'Peluquería', nombre: 'Baño y corte', especie: 'Perro', duracion: '90 min', precio: 25000, observaciones: '' },
  { codigo: 'SV023', categoria: 'Peluquería', nombre: 'Deslanado', especie: 'Perro', duracion: '60 min', precio: 20000, observaciones: '' },
  { codigo: 'SV024', categoria: 'Hospitalización', nombre: 'Hospitalización por día', especie: 'Perro / Gato', duracion: '24 horas', precio: 45000, observaciones: '' },
  { codigo: 'SV025', categoria: 'Hospitalización', nombre: 'Observación clínica', especie: 'Perro / Gato', duracion: '2 horas', precio: 20000, observaciones: '' },
  { codigo: 'SV026', categoria: 'Cirugía', nombre: 'Esterilización canina', especie: 'Perro', duracion: '120 min', precio: 85000, observaciones: '' },
  { codigo: 'SV027', categoria: 'Cirugía', nombre: 'Esterilización felina', especie: 'Gato', duracion: '90 min', precio: 65000, observaciones: '' },
  { codigo: 'SV028', categoria: 'Cirugía', nombre: 'Cirugía menor', especie: 'Perro / Gato', duracion: '60 min', precio: 50000, observaciones: '' },
  { codigo: 'SV029', categoria: 'Odontología', nombre: 'Evaluación dental', especie: 'Perro / Gato', duracion: '30 min', precio: 12000, observaciones: '' },
  { codigo: 'SV030', categoria: 'Odontología', nombre: 'Limpieza dental', especie: 'Perro / Gato', duracion: '60 min', precio: 45000, observaciones: '' },
  { codigo: 'SV031', categoria: 'Certificados', nombre: 'Certificado de salud', especie: 'Perro / Gato', duracion: '20 min', precio: 10000, observaciones: '' },
].map((servicio) => ({
  ...servicio,
  tipo: 'servicio',
  id: servicio.codigo,
  stock: null,
}))

export const productosCatalogo = [...medicamentos, ...servicios]

export const categoriasProductos = [
  ...new Set(productosCatalogo.map((elemento) => elemento.categoria)),
]

export const categoriasMedicamentos = [
  ...new Set(medicamentos.map((producto) => producto.categoria)),
]

export const categoriasServicios = [
  ...new Set(servicios.map((servicio) => servicio.categoria)),
]

export const medicamentosCatalogo = medicamentos
export const serviciosCatalogo = servicios