import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarrerasStore = defineStore('carreras', () => {
  const carreras = ref([
    // Cochabamba
    { 
      id: 1, 
      nombre: 'Ingeniería de Sistemas', 
      codigo: 'SIS', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias Exactas y Tecnología',
      mision: 'Nuestra misión es formar ingenieros de sistemas altamente capacitados y comprometidos con la excelencia académica, la innovación tecnológica y el servicio a la sociedad. Nos esforzamos por proporcionar una educación integral que combine sólidos conocimientos técnicos con habilidades interpersonales y éticas, preparando a nuestros estudiantes para enfrentar los desafíos del mundo digital y contribuir de manera significativa al desarrollo sostenible de la sociedad.',
      vision: 'Ser reconocidos a nivel nacional e internacional como líderes en la formación de ingenieros de sistemas, destacando por nuestra excelencia académica, investigación de vanguardia y contribuciones significativas a la innovación tecnológica y el progreso social. Buscamos ser un referente en la aplicación ética y responsable de la tecnología, promoviendo un entorno inclusivo y diverso que fomente el crecimiento personal y profesional de nuestros estudiantes y colaboradores.',
      perfil_profesional: 'El Ingeniero de Sistemas formado en nuestra institución posee una sólida base de conocimientos en áreas clave como la programación, la ingeniería de software, la gestión de bases de datos, la seguridad informática, las redes de computadoras, la inteligencia artificial y la gestión de proyectos tecnológicos. Además, cuenta con habilidades analíticas y de resolución de problemas, capacidad para trabajar en equipo y comunicarse efectivamente con personas de diferentes disciplinas y contextos.'
    },
    { 
      id: 2, 
      nombre: 'Ingeniería Civil', 
      codigo: 'CIV', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias Exactas y Tecnología',
      mision: 'Formar profesionales de excelencia en ingeniería civil, comprometidos con el desarrollo sostenible de la infraestructura nacional.',
      vision: 'Ser referentes en la formación de ingenieros civiles innovadores y éticos que contribuyan al progreso de Bolivia.',
      perfil_profesional: 'El Ingeniero Civil de UNITEPC está capacitado para diseñar, construir y supervisar obras civiles, aplicando conocimientos técnicos y tecnológicos de vanguardia.'
    },
    { 
      id: 3, 
      nombre: 'Ingeniería Comercial', 
      codigo: 'COM', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias Económicas y Empresariales',
      mision: 'Formar profesionales líderes en gestión empresarial con visión estratégica e innovadora.',
      vision: 'Ser la carrera líder en formación de ejecutivos que impulsen el desarrollo económico del país.',
      perfil_profesional: 'El Ingeniero Comercial de UNITEPC está preparado para liderar y gestionar organizaciones, con capacidad de análisis estratégico y toma de decisiones.'
    },
    { 
      id: 4, 
      nombre: 'Derecho', 
      codigo: 'DER', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias Jurídicas y Sociales',
      mision: 'Formar abogados con sólidos conocimientos jurídicos y valores éticos para la defensa de la justicia.',
      vision: 'Ser reconocidos como formadores de profesionales del derecho comprometidos con la justicia social.',
      perfil_profesional: 'El Abogado de UNITEPC posee conocimientos profundos del ordenamiento jurídico, capacidad de análisis crítico y compromiso con la ética profesional.'
    },
    { 
      id: 5, 
      nombre: 'Medicina', 
      codigo: 'MED', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias de la Salud',
      mision: 'Formar médicos humanistas con excelencia académica y compromiso con la salud de la población.',
      vision: 'Ser la facultad líder en formación médica integral en Bolivia.',
      perfil_profesional: 'El Médico de UNITEPC está formado con sólidos conocimientos científicos, destrezas clínicas y valores humanísticos para la atención integral de la salud.'
    },
    { 
      id: 6, 
      nombre: 'Odontología', 
      codigo: 'ODO', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias de la Salud',
      mision: 'Formar odontólogos con excelencia académica y vocación de servicio.',
      vision: 'Ser referentes en la formación de profesionales de la salud bucal.',
      perfil_profesional: 'El Odontólogo de UNITEPC está capacitado para prevenir, diagnosticar y tratar enfermedades bucales con enfoque integral.'
    },
    { 
      id: 7, 
      nombre: 'Contaduría Pública', 
      codigo: 'CNT', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias Económicas y Empresariales',
      mision: 'Formar contadores públicos con sólidos conocimientos técnicos y ética profesional.',
      vision: 'Ser líderes en la formación de profesionales contables de excelencia.',
      perfil_profesional: 'El Contador Público de UNITEPC está preparado para gestionar información financiera con precisión, ética y responsabilidad.'
    },
    { 
      id: 8, 
      nombre: 'Arquitectura', 
      codigo: 'ARQ', 
      sede_id: 1, 
      activo: true,
      area: 'Ciencias del Hábitat y Diseño',
      mision: 'Formar arquitectos creativos y comprometidos con el diseño sostenible.',
      vision: 'Ser referentes en la formación de arquitectos innovadores y socialmente responsables.',
      perfil_profesional: 'El Arquitecto de UNITEPC está capacitado para diseñar espacios funcionales, estéticos y sostenibles.'
    },
    // La Paz
    { 
      id: 9, 
      nombre: 'Ingeniería de Sistemas', 
      codigo: 'SIS', 
      sede_id: 2, 
      activo: true,
      area: 'Ciencias Exactas y Tecnología',
      mision: 'Nuestra misión es formar ingenieros de sistemas altamente capacitados y comprometidos con la excelencia académica.',
      vision: 'Ser reconocidos como líderes en la formación de ingenieros de sistemas.',
      perfil_profesional: 'El Ingeniero de Sistemas posee conocimientos en programación, software, bases de datos y gestión de proyectos tecnológicos.'
    },
    { 
      id: 10, 
      nombre: 'Derecho', 
      codigo: 'DER', 
      sede_id: 2, 
      activo: true,
      area: 'Ciencias Jurídicas y Sociales',
      mision: 'Formar abogados con sólidos conocimientos jurídicos y valores éticos.',
      vision: 'Ser reconocidos como formadores de profesionales del derecho.',
      perfil_profesional: 'El Abogado posee conocimientos del ordenamiento jurídico y capacidad de análisis crítico.'
    },
    { 
      id: 11, 
      nombre: 'Medicina', 
      codigo: 'MED', 
      sede_id: 2, 
      activo: true,
      area: 'Ciencias de la Salud',
      mision: 'Formar médicos humanistas con excelencia académica.',
      vision: 'Ser facultad líder en formación médica.',
      perfil_profesional: 'El Médico está formado con conocimientos científicos y valores humanísticos.'
    },
    // Santa Cruz
    { 
      id: 12, 
      nombre: 'Ingeniería de Sistemas', 
      codigo: 'SIS', 
      sede_id: 3, 
      activo: true,
      area: 'Ciencias Exactas y Tecnología',
      mision: 'Formar ingenieros de sistemas comprometidos con la innovación tecnológica.',
      vision: 'Ser líderes en formación tecnológica en el oriente boliviano.',
      perfil_profesional: 'El Ingeniero de Sistemas está capacitado para desarrollar soluciones tecnológicas innovadoras.'
    },
    { 
      id: 13, 
      nombre: 'Ingeniería Comercial', 
      codigo: 'COM', 
      sede_id: 3, 
      activo: true,
      area: 'Ciencias Económicas y Empresariales',
      mision: 'Formar profesionales en gestión empresarial con visión estratégica.',
      vision: 'Ser referentes en formación de ejecutivos empresariales.',
      perfil_profesional: 'El Ingeniero Comercial está preparado para liderar organizaciones.'
    },
    { 
      id: 14, 
      nombre: 'Derecho', 
      codigo: 'DER', 
      sede_id: 3, 
      activo: true,
      area: 'Ciencias Jurídicas y Sociales',
      mision: 'Formar abogados comprometidos con la justicia.',
      vision: 'Ser referentes en formación jurídica.',
      perfil_profesional: 'El Abogado posee sólidos conocimientos jurídicos y ética profesional.'
    }
  ])

  const carrerasActivas = computed(() => carreras.value.filter(c => c.activo))
  const totalCarreras = computed(() => carreras.value.length)

  function getCarreraById(id) {
    return carreras.value.find(c => c.id === id)
  }

  function getCarrerasBySede(sedeId) {
    return carreras.value.filter(c => c.sede_id === sedeId && c.activo)
  }

  function getCarrerasByNombre(nombre) {
    return carreras.value.filter(c => 
      c.nombre.toLowerCase().includes(nombre.toLowerCase()) && c.activo
    )
  }

  return {
    carreras,
    carrerasActivas,
    totalCarreras,
    getCarreraById,
    getCarrerasBySede,
    getCarrerasByNombre
  }
})
