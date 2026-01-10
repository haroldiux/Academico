# Estructura de Datos - Sistema Académico UNITEPC

## Jerarquía Principal

```
SEDE (Cochabamba, La Paz, El Alto, Ivirgarzama...)
  │
  └── CAMPUS (Colonial, Juan Pablo II, Florida...) - 1 o más por sede
       │
       └── CARRERA (Medicina, Ing. Sistemas, Derecho...)
            │
            └── MATERIA (Anatomía I, Cálculo I, Programación I...)
                 │      - Pertenece a UNA carrera específica
                 │      - Aunque el nombre coincida entre carreras, son entidades diferentes
                 │
                 └── GRUPO(s) (1, 2, 3, 4...) - Una materia puede tener varios grupos
                      │
                      └── DOCENTE asignado al grupo
```

## Ejemplo Concreto

### Sede: Cochabamba
- **Campus Colonial**
  - Carrera: Medicina
    - Materia: Anatomía I
      - Grupo 1 → Dr. Luis Vargas
      - Grupo 2 → Dr. Luis Vargas
      - Grupo 3 → Dr. Roberto Flores
      - Grupo 4 → Dr. Roberto Flores
    - Materia: Biología Celular
      - Grupo 1 → Dra. María Sánchez
      - Grupo 2 → Dra. María Sánchez
      - Grupo 3 → Dra. María Sánchez

- **Campus Juan Pablo II**
  - Carrera: Ing. de Sistemas
    - Materia: Cálculo I
      - Grupo 1 → Dr. Juan Pérez
      - Grupo 2 → Lic. María López
      - Grupo 3 → Dr. Juan Pérez
    - Materia: Programación I
      - Grupo 1 → Ing. Pedro García
      - Grupo 2 → Ing. Pedro García
      - Grupo 3 → Lic. Ana Torres

### Sede: Ivirgarzama
- **Campus Principal**
  - Carrera: Medicina
    - Materia: Anatomía I
      - Grupo 1 → Dr. Juan Quispe
      - Grupo 2 → Dr. Juan Quispe
      - Grupo 3 → (Sin asignar)
    - Materia: Biología Celular
      - Grupo 1 → Lic. Rosa Condori

### Sede: El Alto
- **Campus Ciudad Satélite**
  - Carrera: Medicina
    - Materia: Anatomía I
      - Grupo 1 → Dra. Carmen Huanca
    - Materia: Biología Celular
      - Grupo 1 → Dra. Carmen Huanca

## Relaciones Importantes

### Un Docente puede:
- Tener **múltiples grupos** de la **misma materia** (ej: Dr. Vargas tiene Anatomía grupos 1 y 2)
- Tener **múltiples materias** diferentes (ej: Dra. Huanca tiene Anatomía y Biología)
- Trabajar en **diferentes carreras** (ej: un docente de Matemáticas en Sistemas y Medicina)
- Trabajar en **diferentes campus/sedes** (según contrato)

### Una Materia:
- Pertenece a UNA carrera específica (aunque el nombre coincida)
- Puede tener 1 o más grupos/paralelos
- Cada grupo tiene UN docente asignado
- Los grupos son por semestre y gestión

### Los Grupos:
- Son paralelos de una materia específica
- Tienen un docente asignado
- Están asociados a un semestre y gestión
- Pertenecen a un campus dentro de una sede

## Modelo de Datos (Entidades)

```
Sede { id, nombre, codigo, ciudad, activo }
  ↓ 1:N
Campus { id, sede_id, nombre, codigo, direccion, activo }
  ↓ N:M (a través de carrera_campus)
Carrera { id, nombre, codigo, activo }
  ↓ 1:N
Materia { id, carrera_id, codigo, nombre, semestre, creditos, activo }
  ↓ 1:N
Grupo { id, materia_id, campus_id, numero, gestion, docente_id, aula, horario }
  ↓ N:1
Docente { id, nombre, email, titulo, sede_id, activo }
```

## Notas de Implementación

1. **Materias por Carrera**: Aunque "Anatomía I" exista en Medicina de todas las sedes, cada instancia es independiente para permitir personalización del contenido.

2. **Grupos Numerados**: Los grupos se identifican por número (1, 2, 3...) en lugar de letras (A, B, C...) según la convención de UNITEPC.

3. **Campus**: Una sede puede tener múltiples campus físicos donde se imparten las clases.

4. **Docentes Multi-grupo**: Un docente puede tener varios grupos de la misma materia, permitiendo carga académica flexible.
