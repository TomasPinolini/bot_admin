/**
 * Seed script: populates industries, niches, products, and services
 * from the content_to_turn_sql.txt reference data.
 *
 * Run with: npx tsx scripts/seed-catalog.ts
 */

import { db, schema } from "../src/db/index.js";
import { generateId } from "../src/utils/id.js";
import { closeDb } from "../src/db/index.js";

const { industries, niches, products, services } = schema;

// ── Raw data ──────────────────────────────────────────
// Each entry: [industry, niche, ...offerings]
// Offerings classified below as P (product) or S (service).

interface NicheEntry {
  industry: string;
  niche: string;
  offerings: string; // raw comma-separated
}

const RAW: NicheEntry[] = [
  // Barberías y Peluquerías
  { industry: "Barberías y Peluquerías", niche: "Barberías de autor / Urbanas", offerings: "Corte de cabello, degradado (fade), perfilado de barba" },
  { industry: "Barberías y Peluquerías", niche: "Peluquerías infantiles", offerings: "Cortes para niños, peinados para eventos escolares" },
  { industry: "Barberías y Peluquerías", niche: "Coloración técnica y Balayage", offerings: "Tintura, decoloración, tratamientos de keratina" },
  { industry: "Barberías y Peluquerías", niche: "Extensiones y Cortinas", offerings: "Colocación de extensiones de pelo natural" },
  { industry: "Barberías y Peluquerías", niche: "Peluquerías caninas", offerings: "Corte higiénico, baño, despeje de almohadillas" },
  // Gastronomía
  { industry: "Gastronomía", niche: "Hamburgueserías artesanales", offerings: "Combos de hamburguesas, papas fritas, bebidas" },
  { industry: "Gastronomía", niche: "Pizzerías de masa madre", offerings: "Pizzas gourmet, faina, empanadas artesanales" },
  { industry: "Gastronomía", niche: "Pastelería de diseño (Candy Bar)", offerings: "Tortas personalizadas, cupcakes, mesas dulces" },
  { industry: "Gastronomía", niche: "Viandas saludables / Keto", offerings: "Menú semanal, dietas personalizadas, viandas congeladas" },
  { industry: "Gastronomía", niche: "Cervecerías y Bares de barrio", offerings: "Reserva de mesas, recarga de growlers, happy hour" },
  // Medicina y Salud
  { industry: "Medicina y Salud", niche: "Centros odontológicos", offerings: "Limpieza dental, ortodoncia, blanqueamiento" },
  { industry: "Medicina y Salud", niche: "Consultorios de psicología", offerings: "Sesiones presenciales y online, terapia de pareja" },
  { industry: "Medicina y Salud", niche: "Centros de kinesiología", offerings: "Rehabilitación física, masajes descontracturantes" },
  { industry: "Medicina y Salud", niche: "Laboratorios de análisis clínicos", offerings: "Extracción de sangre, entrega de resultados digitales" },
  { industry: "Medicina y Salud", niche: "Centros de estética (Depilación láser)", offerings: "Soprano Ice, limpiezas faciales, rellenos con ácido hialurónico" },
  // Bienestar y Fitness
  { industry: "Bienestar y Fitness", niche: "Gimnasios de CrossFit / Box", offerings: "Clases grupales, abonos mensuales, pases diarios" },
  { industry: "Bienestar y Fitness", niche: "Estudios de Yoga y Pilates", offerings: "Clases de Hatha Yoga, Reformer, meditación" },
  { industry: "Bienestar y Fitness", niche: "Personal Trainers", offerings: "Entrenamiento personalizado, planes de rutina por PDF" },
  { industry: "Bienestar y Fitness", niche: "Nutricionistas", offerings: "Planes de alimentación, medición de masa corporal" },
  { industry: "Bienestar y Fitness", niche: "Tiendas de suplementos", offerings: "Proteínas, creatina, quemadores de grasa" },
  // Indumentaria y Moda
  { industry: "Indumentaria y Moda", niche: "Showrooms de ropa femenina", offerings: "Vestidos, blusas, asesoría de imagen" },
  { industry: "Indumentaria y Moda", niche: "Indumentaria deportiva", offerings: "Leggings, tops, zapatillas de running" },
  { industry: "Indumentaria y Moda", niche: "Ropa de bebés y niños", offerings: "Ajuar de nacimiento, bodies, ropa escolar" },
  { industry: "Indumentaria y Moda", niche: "Lencería y mallas", offerings: "Conjuntos de ropa interior, bikinis, pijamas" },
  { industry: "Indumentaria y Moda", niche: "Uniformes de trabajo", offerings: "Ambos médicos, ropa de seguridad, bordados" },
  // Servicios para el Hogar
  { industry: "Servicios para el Hogar", niche: "Climatización (Aire acondicionado)", offerings: "Instalación de aire acondicionado, carga de gas, mantenimiento preventivo" },
  { industry: "Servicios para el Hogar", niche: "Plomería y Gas", offerings: "Reparación de fugas, instalación de termotanques" },
  { industry: "Servicios para el Hogar", niche: "Electricistas matriculados", offerings: "Cableado eléctrico, instalación de tableros, luces LED" },
  { industry: "Servicios para el Hogar", niche: "Servicios de limpieza (Doméstica)", offerings: "Limpieza por hora, limpieza de fin de obra" },
  { industry: "Servicios para el Hogar", niche: "Mantenimiento de piscinas", offerings: "Limpieza de fondo, balance de PH, cloro" },
  // Automotriz
  { industry: "Automotriz", niche: "Talleres mecánicos", offerings: "Cambio de aceite y filtro, frenos, tren delantero" },
  { industry: "Automotriz", niche: "Lavaderos de autos (Detailing)", offerings: "Lavado artesanal, pulido, tratamiento cerámico" },
  { industry: "Automotriz", niche: "Gomerías y Alineación", offerings: "Neumáticos, balanceo, parches" },
  { industry: "Automotriz", niche: "Talleres de chapa y pintura", offerings: "Reparación de bollos, pintura bicapa, pulido" },
  { industry: "Automotriz", niche: "Cerrajerías del automotor", offerings: "Copia de llaves con chip, apertura de puertas" },
  // Mascotas
  { industry: "Mascotas", niche: "Veterinarias de barrio", offerings: "Consultas veterinarias, vacunas, desparasitación" },
  { industry: "Mascotas", niche: "Pet Shops", offerings: "Alimento balanceado, juguetes para mascotas, correas" },
  { industry: "Mascotas", niche: "Adiestramiento canino", offerings: "Clases de obediencia, modificación de conducta" },
  { industry: "Mascotas", niche: "Pensionados caninos", offerings: "Hospedaje por día, guardería de día" },
  { industry: "Mascotas", niche: "Repostería canina", offerings: "Tortas de cumpleaños para perros, snacks naturales" },
  // Educación y Cursos
  { industry: "Educación y Cursos", niche: "Institutos de idiomas", offerings: "Cursos de inglés, cursos de portugués, exámenes internacionales" },
  { industry: "Educación y Cursos", niche: "Clases de apoyo escolar", offerings: "Clases de matemática, clases de física, preparación de ingresos" },
  { industry: "Educación y Cursos", niche: "Escuelas de conductores", offerings: "Clases de manejo, curso teórico para licencia" },
  { industry: "Educación y Cursos", niche: "Talleres de oficio (Carpintería/Costura)", offerings: "Cursos cortos presenciales, herramientas de oficio" },
  { industry: "Educación y Cursos", niche: "Capacitación en Marketing Digital", offerings: "Cursos de Community Manager, cursos de Ads, cursos de Reels" },
  // Construcción y Reformas
  { industry: "Construcción y Reformas", niche: "Instaladores de Drywall (Durlock)", offerings: "Tabiques, cielorrasos, muebles de placa" },
  { industry: "Construcción y Reformas", niche: "Pintores de obra", offerings: "Pintura interior/exterior, aplicación de impermeabilizantes" },
  { industry: "Construcción y Reformas", niche: "Herrerías de obra", offerings: "Rejas, portones automáticos, pérgolas" },
  { industry: "Construcción y Reformas", niche: "Vidrierías", offerings: "Espejos a medida, mamparas de baño, DVH" },
  { industry: "Construcción y Reformas", niche: "Venta de áridos y corralones", offerings: "Arena, cemento, ladrillos, piedra partida" },
  // Eventos
  { industry: "Eventos", niche: "Alquiler de livings y carpas", offerings: "Puffs, gazebos, mesas ratonas" },
  { industry: "Eventos", niche: "Fotógrafos de eventos", offerings: "Books de 15 años, cobertura de casamientos, eventos corporativos" },
  { industry: "Eventos", niche: "Alquiler de inflables y plazas blandas", offerings: "Toboganes, camas elásticas, juegos de madera" },
  { industry: "Eventos", niche: "Servicio de DJ e iluminación", offerings: "Sonido para fiestas, luces robóticas, máquinas de humo" },
  { industry: "Eventos", niche: "Catering para eventos pequeños", offerings: "Pata flambeada, finger food, lunch" },
  // Turismo Local
  { industry: "Turismo Local", niche: "Cabañas y complejos vacacionales", offerings: "Alquiler temporario, servicio de blanco, desayuno" },
  { industry: "Turismo Local", niche: "Guías de pesca o aventura", offerings: "Excursiones guiadas, alquiler de equipos" },
  { industry: "Turismo Local", niche: "Transporte de pasajeros (Combis)", offerings: "Traslados a aeropuertos, viajes grupales" },
  { industry: "Turismo Local", niche: "Alquiler de equipos de nieve/playa", offerings: "Tablas de surf, esquíes, gazebos de playa" },
  { industry: "Turismo Local", niche: "Agencias de viajes regionales", offerings: "Paquetes turísticos, excursiones, traslados" },
  // Inmobiliaria
  { industry: "Inmobiliaria", niche: "Administración de alquileres", offerings: "Cobro de expensas, gestión de reparaciones" },
  { industry: "Inmobiliaria", niche: "Ventas de departamentos", offerings: "Tasaciones, visitas programadas, asesoría legal" },
  { industry: "Inmobiliaria", niche: "Alquileres temporarios (Airbnb)", offerings: "Check-in/out, limpieza, gestión de reservas" },
  { industry: "Inmobiliaria", niche: "Loteos y desarrollos", offerings: "Venta de terrenos, barrios abiertos, barrios cerrados" },
  { industry: "Inmobiliaria", niche: "Gestión de consorcios", offerings: "Liquidación de sueldos de encargados, mantenimiento edilicio" },
  // Tecnología
  { industry: "Tecnología", niche: "Servicio técnico de celulares", offerings: "Cambio de módulos, baterías, pin de carga" },
  { industry: "Tecnología", niche: "Reparación de notebooks/PC", offerings: "Formateo, limpieza física, aumento de RAM" },
  { industry: "Tecnología", niche: "Venta de accesorios (Gaming)", offerings: "Teclados mecánicos, mouses, auriculares" },
  { industry: "Tecnología", niche: "Instalación de cámaras de seguridad", offerings: "Cámaras IP, alarmas, monitoreo móvil" },
  { industry: "Tecnología", niche: "Insumos de impresión", offerings: "Cartuchos, tóners, papel fotográfico" },
  // Servicios Profesionales
  { industry: "Servicios Profesionales", niche: "Estudios contables", offerings: "Liquidación de impuestos, monotributo, liquidación de haberes" },
  { industry: "Servicios Profesionales", niche: "Abogados (Sucesiones/Laboral)", offerings: "Consultas legales, inicio de demandas" },
  { industry: "Servicios Profesionales", niche: "Arquitectos (Proyectos)", offerings: "Planos, dirección de obra, renders 3D" },
  { industry: "Servicios Profesionales", niche: "Gestores del automotor", offerings: "Transferencias, informes de dominio, patentes" },
  { industry: "Servicios Profesionales", niche: "Traductores públicos", offerings: "Traducciones oficiales, legalizaciones" },
  // Hogar y Decoración
  { industry: "Hogar y Decoración", niche: "Viveros y Paisajismo", offerings: "Plantas de interior, diseño de jardines, macetas" },
  { industry: "Hogar y Decoración", niche: "Tiendas de iluminación", offerings: "Lámparas colgantes, dicroicas, apliques" },
  { industry: "Hogar y Decoración", niche: "Tapicerías", offerings: "Retapizado de sillones, confección de almohadones" },
  { industry: "Hogar y Decoración", niche: "Blanquería", offerings: "Sábanas, acolchados, toallas de alta gama" },
  { industry: "Hogar y Decoración", niche: "Mueblerías a medida", offerings: "Placares, interiores de placard, racks de TV" },
  // Logística y Envíos
  { industry: "Logística y Envíos", niche: "Mensajerías en moto (Cadetería)", offerings: "Envío de documentos, trámites bancarios" },
  { industry: "Logística y Envíos", niche: "Fletes y Mudanzas locales", offerings: "Traslado de muebles, carga y descarga" },
  { industry: "Logística y Envíos", niche: "Transporte de encomiendas", offerings: "Envíos al interior, logística para e-commerce" },
  { industry: "Logística y Envíos", niche: "Alquiler de bauleras (Self storage)", offerings: "Espacios de guardado temporal" },
  { industry: "Logística y Envíos", niche: "Reparto de agua y soda", offerings: "Bidones de 20L, dispensers, sifones" },
  // Papelería y Gráfica
  { industry: "Papelería y Gráfica", niche: "Imprentas digitales", offerings: "Tarjetas personales, folletos, flyers" },
  { industry: "Papelería y Gráfica", niche: "Librerías escolares", offerings: "Útiles escolares, textos escolares, fotocopias" },
  { industry: "Papelería y Gráfica", niche: "Cartelería y vinilos", offerings: "Letras corpóreas, ploteo de vidrieras, ploteo de vehículos" },
  { industry: "Papelería y Gráfica", niche: "Regalería personalizada", offerings: "Tazas sublimadas, remeras personalizadas, llaveros" },
  { industry: "Papelería y Gráfica", niche: "Encuadernación", offerings: "Anillados, tesis, restauración de libros" },
];

// ── Classification ────────────────────────────────────
// Products = tangible goods you take home / consume
// Services = labor, activity, or ongoing work

const PRODUCTS = new Set([
  // Gastronomía
  "Combos de hamburguesas", "Papas fritas", "Bebidas",
  "Pizzas gourmet", "Faina", "Empanadas artesanales",
  "Tortas personalizadas", "Cupcakes", "Mesas dulces",
  "Menú semanal", "Viandas congeladas",
  // Bienestar
  "Proteínas", "Creatina", "Quemadores de grasa",
  "Planes de rutina por PDF",
  // Indumentaria
  "Vestidos", "Blusas", "Leggings", "Tops", "Zapatillas de running",
  "Ajuar de nacimiento", "Bodies", "Ropa escolar",
  "Conjuntos de ropa interior", "Bikinis", "Pijamas",
  "Ambos médicos", "Ropa de seguridad",
  // Hogar
  "Luces LED",
  // Automotriz
  "Neumáticos", "Parches",
  // Mascotas
  "Alimento balanceado", "Juguetes para mascotas", "Correas",
  "Tortas de cumpleaños para perros", "Snacks naturales",
  // Educación
  "Herramientas de oficio",
  // Construcción
  "Tabiques", "Cielorrasos", "Muebles de placa",
  "Rejas", "Portones automáticos", "Pérgolas",
  "Espejos a medida", "Mamparas de baño", "DVH",
  "Arena", "Cemento", "Ladrillos", "Piedra partida",
  // Eventos
  "Puffs", "Gazebos", "Mesas ratonas",
  "Toboganes", "Camas elásticas", "Juegos de madera",
  "Máquinas de humo",
  // Turismo
  "Tablas de surf", "Esquíes", "Gazebos de playa",
  // Tecnología
  "Baterías", "Pin de carga", "Módulos de pantalla",
  "Teclados mecánicos", "Mouses", "Auriculares",
  "Cámaras IP", "Alarmas",
  "Cartuchos", "Tóners", "Papel fotográfico",
  // Hogar y Decoración
  "Plantas de interior", "Macetas",
  "Lámparas colgantes", "Dicroicas", "Apliques",
  "Sábanas", "Acolchados", "Toallas de alta gama",
  "Placares", "Interiores de placard", "Racks de TV",
  // Logística
  "Bidones de 20L", "Dispensers", "Sifones",
  // Papelería
  "Tarjetas personales", "Folletos", "Flyers",
  "Útiles escolares", "Textos escolares",
  "Letras corpóreas",
  "Tazas sublimadas", "Remeras personalizadas", "Llaveros",
  // Pata flambeada / finger food are products (food items)
  "Pata flambeada", "Finger food", "Lunch",
]);

const SERVICES = new Set([
  // Barberías
  "Corte de cabello", "Degradado (fade)", "Perfilado de barba",
  "Cortes para niños", "Peinados para eventos escolares",
  "Tintura", "Decoloración", "Tratamientos de keratina",
  "Colocación de extensiones de pelo natural",
  "Corte higiénico", "Baño", "Despeje de almohadillas",
  // Gastronomía (services)
  "Dietas personalizadas",
  "Reserva de mesas", "Recarga de growlers", "Happy hour",
  // Medicina
  "Limpieza dental", "Ortodoncia", "Blanqueamiento",
  "Sesiones presenciales y online", "Terapia de pareja",
  "Rehabilitación física", "Masajes descontracturantes",
  "Extracción de sangre", "Entrega de resultados digitales",
  "Soprano Ice", "Limpiezas faciales", "Rellenos con ácido hialurónico",
  // Bienestar
  "Clases grupales", "Abonos mensuales", "Pases diarios",
  "Clases de Hatha Yoga", "Reformer", "Meditación",
  "Entrenamiento personalizado",
  "Planes de alimentación", "Medición de masa corporal",
  // Indumentaria
  "Asesoría de imagen", "Bordados",
  // Hogar
  "Instalación de aire acondicionado", "Carga de gas", "Mantenimiento preventivo",
  "Reparación de fugas", "Instalación de termotanques",
  "Cableado eléctrico", "Instalación de tableros",
  "Limpieza por hora", "Limpieza de fin de obra",
  "Limpieza de fondo", "Balance de PH",
  // Automotriz
  "Cambio de aceite y filtro", "Frenos", "Tren delantero",
  "Lavado artesanal", "Pulido", "Tratamiento cerámico",
  "Balanceo",
  "Reparación de bollos", "Pintura bicapa",
  "Copia de llaves con chip", "Apertura de puertas",
  // Mascotas
  "Consultas veterinarias", "Vacunas", "Desparasitación",
  "Clases de obediencia", "Modificación de conducta",
  "Hospedaje por día", "Guardería de día",
  // Educación
  "Cursos de inglés", "Cursos de portugués", "Exámenes internacionales",
  "Clases de matemática", "Clases de física", "Preparación de ingresos",
  "Clases de manejo", "Curso teórico para licencia",
  "Cursos cortos presenciales",
  "Cursos de Community Manager", "Cursos de Ads", "Cursos de Reels",
  // Construcción
  "Pintura interior/exterior", "Aplicación de impermeabilizantes",
  // Eventos
  "Books de 15 años", "Cobertura de casamientos", "Eventos corporativos",
  "Sonido para fiestas", "Luces robóticas",
  // Turismo
  "Alquiler temporario", "Servicio de blanco", "Desayuno",
  "Excursiones guiadas", "Alquiler de equipos",
  "Traslados a aeropuertos", "Viajes grupales",
  "Paquetes turísticos", "Excursiones", "Traslados",
  // Inmobiliaria
  "Cobro de expensas", "Gestión de reparaciones",
  "Tasaciones", "Visitas programadas", "Asesoría legal",
  "Check-in/out", "Limpieza", "Gestión de reservas",
  "Venta de terrenos", "Barrios abiertos", "Barrios cerrados",
  "Liquidación de sueldos de encargados", "Mantenimiento edilicio",
  // Tecnología
  "Cambio de módulos", "Formateo", "Limpieza física", "Aumento de RAM",
  "Monitoreo móvil",
  // Servicios Profesionales
  "Liquidación de impuestos", "Monotributo", "Liquidación de haberes",
  "Consultas legales", "Inicio de demandas",
  "Planos", "Dirección de obra", "Renders 3D",
  "Transferencias", "Informes de dominio", "Patentes",
  "Traducciones oficiales", "Legalizaciones",
  // Hogar y Decoración
  "Diseño de jardines",
  "Retapizado de sillones", "Confección de almohadones",
  // Logística
  "Envío de documentos", "Trámites bancarios",
  "Traslado de muebles", "Carga y descarga",
  "Envíos al interior", "Logística para e-commerce",
  "Espacios de guardado temporal",
  // Papelería
  "Fotocopias",
  "Ploteo de vidrieras", "Ploteo de vehículos",
  "Anillados", "Tesis", "Restauración de libros",
  // Cloro is a product used in pool maintenance
]);

// Cloro → product
PRODUCTS.add("Cloro");

// ── Main ──────────────────────────────────────────────

async function seed() {
  console.log("Seeding business catalog...\n");

  // 1. Collect unique industries
  const industryNames = [...new Set(RAW.map((r) => r.industry))];
  const industryMap = new Map<string, string>(); // name → id

  console.log(`Creating ${industryNames.length} industries...`);
  for (const name of industryNames) {
    const id = generateId("industry");
    await db.insert(industries).values({ id, name, description: null });
    industryMap.set(name, id);
  }

  // 2. Create niches
  console.log(`Creating ${RAW.length} niches...`);
  for (const entry of RAW) {
    const industryId = industryMap.get(entry.industry)!;
    const id = generateId("niche");
    await db.insert(niches).values({ id, industryId, name: entry.niche, description: null });
  }

  // 3. Collect and deduplicate all offerings, split into products & services
  const productSet = new Set<string>();
  const serviceSet = new Set<string>();

  for (const entry of RAW) {
    const items = entry.offerings.split(",").map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      if (PRODUCTS.has(item)) {
        productSet.add(item);
      } else if (SERVICES.has(item)) {
        serviceSet.add(item);
      } else {
        // Default: if not classified, guess based on simple heuristics
        // Words that suggest service: instalación, reparación, clase, curso, limpieza, servicio, gestión
        const lower = item.toLowerCase();
        const serviceWords = [
          "instalación", "reparación", "clase", "curso", "limpieza",
          "servicio", "gestión", "liquidación", "consulta", "asesor",
          "mantenimiento", "tratamiento", "sesión", "entrenamiento",
          "alquiler", "traslado", "envío", "cobertura", "dirección",
        ];
        if (serviceWords.some((w) => lower.includes(w))) {
          serviceSet.add(item);
        } else {
          // Default to product for tangible-sounding items
          productSet.add(item);
        }
      }
    }
  }

  console.log(`Creating ${productSet.size} products...`);
  for (const name of [...productSet].sort()) {
    const id = generateId("product");
    await db.insert(products).values({ id, name, description: null });
  }

  console.log(`Creating ${serviceSet.size} services...`);
  for (const name of [...serviceSet].sort()) {
    const id = generateId("service");
    await db.insert(services).values({ id, name, description: null });
  }

  console.log("\nDone! Summary:");
  console.log(`  Industries: ${industryNames.length}`);
  console.log(`  Niches:     ${RAW.length}`);
  console.log(`  Products:   ${productSet.size}`);
  console.log(`  Services:   ${serviceSet.size}`);
}

seed()
  .then(() => closeDb())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await closeDb();
    process.exit(1);
  });
