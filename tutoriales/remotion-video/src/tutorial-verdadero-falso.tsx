import React from 'react'
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

type Scene = {
  start: number
  end: number
  title: string
  subtitle: string
  caption: string
  focus:
    | 'tab'
    | 'partial'
    | 'group'
    | 'new'
    | 'type'
    | 'difficulty'
    | 'statement'
    | 'answer'
    | 'image'
    | 'preview'
    | 'save'
    | 'list'
}

const scenes: Scene[] = [
  {
    start: 0,
    end: 240,
    title: 'Registrar pregunta Verdadero/Falso',
    subtitle: 'Banco de Preguntas',
    caption:
      'En este tutorial veremos como registrar una pregunta de tipo Verdadero o Falso Simple.',
    focus: 'tab',
  },
  {
    start: 240,
    end: 540,
    title: 'Abre el banco',
    subtitle: 'Desde la asignatura',
    caption:
      'Ingresa al apartado Banco de Preguntas. Aqui se gestiona el banco asociado al parcial y grupo teorico.',
    focus: 'tab',
  },
  {
    start: 540,
    end: 960,
    title: 'Define el contexto',
    subtitle: '2do Parcial y Grupo Teorico',
    caption:
      'Selecciona el 2do Parcial y luego el Grupo Teorico correspondiente antes de registrar.',
    focus: 'partial',
  },
  {
    start: 960,
    end: 1260,
    title: 'Nueva pregunta',
    subtitle: 'Formulario de registro',
    caption: 'Cuando el contexto este seleccionado, pulsa Nueva pregunta.',
    focus: 'new',
  },
  {
    start: 1260,
    end: 1650,
    title: 'Tipo de pregunta',
    subtitle: 'Verdadero o Falso Simple',
    caption: 'En Tipo de Pregunta selecciona Verdadero o Falso Simple.',
    focus: 'type',
  },
  {
    start: 1650,
    end: 2040,
    title: 'Dificultad y enunciado',
    subtitle: 'Una afirmacion clara',
    caption:
      'Selecciona la dificultad y escribe una afirmacion que solo pueda responderse como verdadera o falsa.',
    focus: 'statement',
  },
  {
    start: 2040,
    end: 2400,
    title: 'Respuesta correcta',
    subtitle: 'A o B',
    caption:
      'Marca A. Verdadero si la afirmacion es verdadera o B. Falso si la afirmacion es falsa.',
    focus: 'answer',
  },
  {
    start: 2400,
    end: 2760,
    title: 'Imagen opcional',
    subtitle: 'Hasta 5 MB',
    caption: 'Si la pregunta lo requiere, adjunta una imagen desde Adjuntar/Cambiar Imagen.',
    focus: 'image',
  },
  {
    start: 2760,
    end: 3150,
    title: 'Previsualiza',
    subtitle: 'Revisa el PDF',
    caption: 'Antes de guardar, usa Previsualizar PDF para comprobar como se vera en el examen.',
    focus: 'preview',
  },
  {
    start: 3150,
    end: 3540,
    title: 'Registra',
    subtitle: 'Guardar en el banco',
    caption:
      'Pulsa Registrar Pregunta. El sistema guardara la pregunta en el parcial y grupo seleccionados.',
    focus: 'save',
  },
  {
    start: 3540,
    end: 3750,
    title: 'Verifica',
    subtitle: 'Pregunta registrada correctamente',
    caption: 'Revisa que la pregunta aparezca en la lista y que los conteos se actualicen.',
    focus: 'list',
  },
]

const colors = {
  bg: '#f5f7fb',
  panel: '#ffffff',
  ink: '#162033',
  muted: '#637089',
  purple: '#4527a0',
  purple2: '#6d28d9',
  blue: '#2563eb',
  teal: '#0f766e',
  green: '#059669',
  orange: '#d97706',
  red: '#dc2626',
  line: '#d9e0ec',
}

const getScene = (frame: number) =>
  scenes.find((scene) => frame >= scene.start && frame < scene.end) ?? scenes[scenes.length - 1]

const focusMap: Record<Scene['focus'], { x: number; y: number; w: number; h: number }> = {
  tab: { x: 540, y: 188, w: 260, h: 56 },
  partial: { x: 490, y: 332, w: 520, h: 86 },
  group: { x: 1040, y: 332, w: 390, h: 86 },
  new: { x: 1454, y: 474, w: 236, h: 64 },
  type: { x: 708, y: 352, w: 620, h: 60 },
  difficulty: { x: 708, y: 530, w: 400, h: 62 },
  statement: { x: 708, y: 622, w: 620, h: 170 },
  answer: { x: 708, y: 820, w: 520, h: 74 },
  image: { x: 708, y: 254, w: 306, h: 62 },
  preview: { x: 1048, y: 930, w: 242, h: 58 },
  save: { x: 1312, y: 930, w: 250, h: 58 },
  list: { x: 456, y: 604, w: 1060, h: 248 },
}

const ease = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

const boxShadow = '0 24px 80px rgba(22, 32, 51, 0.16)'

const Header: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 86,
      background: colors.panel,
      borderBottom: `1px solid ${colors.line}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 44px',
      gap: 18,
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        background: colors.purple,
        color: 'white',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 800,
        fontSize: 18,
      }}
    >
      U
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: colors.ink }}>SISTEMA ACADEMICO</div>
      <div style={{ fontSize: 13, color: colors.muted }}>Documentacion academica UNITEPC</div>
    </div>
    <div style={{ marginLeft: 'auto', color: colors.muted, fontSize: 18 }}>Rol: Docente</div>
  </div>
)

const Sidebar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 86,
      bottom: 0,
      left: 0,
      width: 292,
      background: '#111827',
      color: 'white',
      padding: '34px 24px',
    }}
  >
    {['Mis Asignaturas', 'Documentacion', 'Perfil'].map((item, index) => (
      <div
        key={item}
        style={{
          height: 56,
          borderRadius: 10,
          background: index === 1 ? 'rgba(255,255,255,0.14)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          marginBottom: 10,
          fontSize: 20,
          fontWeight: index === 1 ? 800 : 500,
        }}
      >
        {item}
      </div>
    ))}
  </div>
)

const TabBar: React.FC = () => (
  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
    {['Datos', 'Unidades', 'Planificacion', 'Banco de Preguntas'].map((item) => (
      <div
        key={item}
        style={{
          padding: '16px 22px',
          borderRadius: 10,
          background: item === 'Banco de Preguntas' ? colors.purple : '#eef2ff',
          color: item === 'Banco de Preguntas' ? 'white' : colors.purple,
          fontWeight: 800,
          fontSize: 18,
        }}
      >
        {item}
      </div>
    ))}
  </div>
)

const BankScreen: React.FC<{ scene: Scene }> = ({ scene }) => {
  const showQuestion = scene.focus === 'list'
  return (
    <div
      style={{
        position: 'absolute',
        left: 342,
        right: 54,
        top: 126,
        bottom: 50,
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 900, color: colors.ink }}>Switching y Routing</div>
      <div style={{ fontSize: 18, color: colors.muted, marginTop: 6 }}>
        Configuracion del banco de preguntas por parcial y grupo teorico
      </div>
      <TabBar />

      <div
        style={{
          marginTop: 34,
          background: '#eef4f7',
          border: `1px solid ${colors.line}`,
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          gap: 30,
          alignItems: 'end',
        }}
      >
        <div style={{ width: 520 }}>
          <div style={{ color: colors.blue, fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
            Selecciona el parcial que gobernara este banco
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {['1P', '2P', 'EF', '2I'].map((item) => (
              <div
                key={item}
                style={{
                  height: 52,
                  borderRadius: 8,
                  background: item === '2P' ? colors.purple2 : 'white',
                  color: item === '2P' ? 'white' : colors.purple,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 390 }}>
          <div style={{ color: colors.muted, fontWeight: 800, fontSize: 16, marginBottom: 12 }}>
            Seleccionar Grupo Teorico
          </div>
          <div
            style={{
              height: 58,
              borderRadius: 8,
              border: `2px solid ${colors.line}`,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              fontSize: 20,
              fontWeight: 800,
              color: colors.ink,
            }}
          >
            Grupo A
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          background: `linear-gradient(135deg, ${colors.purple}, ${colors.purple2})`,
          borderRadius: '12px 12px 0 0',
          minHeight: 96,
          padding: '18px 24px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 900 }}>Banco de Preguntas</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {['download', 'share', 'fact', 'preview', 'upload', 'delete'].map((item) => (
            <div
              key={item}
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                background: 'rgba(255,255,255,0.16)',
              }}
            />
          ))}
          <div
            style={{
              height: 54,
              borderRadius: 27,
              background: colors.green,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px',
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            Nueva pregunta
          </div>
        </div>
      </div>

      <div
        style={{
          background: colors.panel,
          border: `1px solid ${colors.line}`,
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          minHeight: 330,
          padding: 28,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          <Stat title="Banco activo" value="2do Parcial - Grupo A" color={colors.purple} />
          <Stat title="Preguntas evaluables" value={showQuestion ? '1' : '0'} color={colors.blue} />
          <Stat
            title="Distribucion"
            value={showQuestion ? 'En avance' : 'Sin preguntas'}
            color={colors.orange}
          />
        </div>
        {showQuestion ? (
          <QuestionCard />
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 74, color: colors.muted, fontSize: 24 }}>
            No hay preguntas registradas para 2do Parcial - Grupo A.
          </div>
        )}
      </div>
    </div>
  )
}

const Stat: React.FC<{ title: string; value: string; color: string }> = ({
  title,
  value,
  color,
}) => (
  <div
    style={{
      border: `1px solid ${colors.line}`,
      borderRadius: 10,
      padding: 18,
      background: '#f8fafc',
    }}
  >
    <div style={{ fontSize: 15, color: colors.muted, fontWeight: 800 }}>{title}</div>
    <div style={{ fontSize: 22, color, fontWeight: 900, marginTop: 8 }}>{value}</div>
  </div>
)

const QuestionCard: React.FC = () => (
  <div
    style={{
      marginTop: 26,
      border: `1px solid ${colors.line}`,
      borderRadius: 12,
      padding: 22,
      background: '#ffffff',
      boxShadow: '0 10px 24px rgba(22, 32, 51, 0.08)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Pill label="Verdadero o Falso Simple" color={colors.green} />
      <Pill label="Facil" color={colors.blue} />
      <Pill label="2do Parcial" color={colors.orange} />
      <Pill label="GT: A" color={colors.teal} />
    </div>
    <div style={{ fontSize: 23, fontWeight: 800, color: colors.ink, marginTop: 18 }}>
      La capital constitucional de Bolivia es Sucre.
    </div>
    <div style={{ display: 'flex', gap: 14, marginTop: 18 }}>
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 10,
          background: '#dcfce7',
          color: '#166534',
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        A. Verdadero
      </div>
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 10,
          background: '#f1f5f9',
          color: colors.muted,
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        B. Falso
      </div>
    </div>
  </div>
)

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div
    style={{
      background: color,
      color: 'white',
      borderRadius: 16,
      padding: '7px 12px',
      fontSize: 14,
      fontWeight: 900,
    }}
  >
    {label}
  </div>
)

const Modal: React.FC<{ visible: boolean; scene: Scene }> = ({ visible, scene }) => {
  const frame = useCurrentFrame()
  const scale = spring({
    frame: Math.max(0, frame - 1120),
    fps: 30,
    config: { damping: 18, stiffness: 120 },
  })
  const opacity = visible ? ease(frame, 1120, 20) : 0

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.38)',
        opacity,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 980,
          height: 900,
          background: colors.panel,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow,
          transform: `scale(${0.96 + scale * 0.04})`,
        }}
      >
        <div
          style={{
            height: 76,
            background: colors.purple,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '0 30px',
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          Registrar Nueva Pregunta
        </div>
        <div style={{ padding: 24, paddingBottom: 98 }}>
          <div
            style={{
              padding: 16,
              background: '#dbeafe',
              color: '#1e3a8a',
              borderRadius: 10,
              fontSize: 18,
              lineHeight: 1.35,
              fontWeight: 700,
            }}
          >
            Completa una afirmacion y marca A si es Verdadero o B si es Falso.
          </div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <Field label="Adjuntar/Cambiar Imagen" value="Opcional - maximo 5 MB" />
            <Field label="Tipo de Pregunta" value="Verdadero o Falso Simple" strong />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Parcial Activo" value="2do Parcial" readonly />
              <Field label="Grupo Teorico" value="Grupo A" readonly />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: colors.muted, marginBottom: 10 }}>
                Dificultad
              </div>
              <div style={{ display: 'flex', gap: 8, width: 400 }}>
                {['Facil', 'Medio', 'Dificil'].map((item) => (
                  <div
                    key={item}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: 8,
                      background: item === 'Facil' ? colors.purple2 : '#eef2f7',
                      color: item === 'Facil' ? 'white' : colors.muted,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: colors.muted, marginBottom: 10 }}>
                Enunciado de la pregunta
              </div>
              <div
                style={{
                  minHeight: 116,
                  border: `2px solid ${colors.line}`,
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 22,
                  color: colors.ink,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                La capital constitucional de Bolivia es Sucre.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: colors.ink, marginBottom: 14 }}>
                Respuesta correcta
              </div>
              <div style={{ display: 'flex', gap: 22, fontSize: 22, color: colors.ink }}>
                <Radio checked label="A. Verdadero" />
                <Radio checked={false} label="B. Falso" />
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: 82,
            borderTop: `1px solid ${colors.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 16,
            padding: '0 30px',
            background: colors.panel,
          }}
        >
          <Button label="Cancelar" variant="ghost" />
          <Button label="Previsualizar PDF" variant="outline" />
          <Button label="Registrar Pregunta" variant="solid" />
        </div>
      </div>
      <ModalFocus scene={scene} />
    </div>
  )
}

const Field: React.FC<{ label: string; value: string; strong?: boolean; readonly?: boolean }> = ({
  label,
  value,
  strong,
  readonly,
}) => (
  <div>
    <div style={{ fontSize: 16, fontWeight: 900, color: colors.muted, marginBottom: 8 }}>
      {label}
    </div>
    <div
      style={{
        height: 58,
        borderRadius: 10,
        border: `2px solid ${readonly ? '#e5e7eb' : colors.line}`,
        background: readonly ? '#f8fafc' : 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        color: strong ? colors.purple : colors.ink,
        fontSize: 20,
        fontWeight: strong ? 900 : 700,
      }}
    >
      {value}
    </div>
  </div>
)

const Radio: React.FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        border: `3px solid ${colors.purple}`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {checked ? (
        <div style={{ width: 12, height: 12, borderRadius: 6, background: colors.purple }} />
      ) : null}
    </div>
    {label}
  </div>
)

const Button: React.FC<{ label: string; variant: 'ghost' | 'outline' | 'solid' }> = ({
  label,
  variant,
}) => (
  <div
    style={{
      height: 54,
      borderRadius: 10,
      padding: '0 18px',
      display: 'grid',
      placeItems: 'center',
      fontSize: 18,
      fontWeight: 900,
      background: variant === 'solid' ? colors.purple : 'white',
      color: variant === 'solid' ? 'white' : variant === 'outline' ? colors.purple : colors.muted,
      border: variant === 'outline' ? `2px solid ${colors.purple}` : 'none',
    }}
  >
    {label}
  </div>
)

const Focus: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame()
  const target = focusMap[scene.focus]
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.12, 0.42])
  const opacity = ease(frame, scene.start, 18)
  const shouldHide = [
    'type',
    'difficulty',
    'statement',
    'answer',
    'image',
    'preview',
    'save',
  ].includes(scene.focus)

  if (shouldHide) return null

  const effectiveTarget = scene.focus === 'partial' && frame > 750 ? focusMap.group : target

  return (
    <div
      style={{
        position: 'absolute',
        left: effectiveTarget.x,
        top: effectiveTarget.y,
        width: effectiveTarget.w,
        height: effectiveTarget.h,
        borderRadius: 14,
        border: `5px solid rgba(5, 150, 105, ${0.72 + pulse})`,
        boxShadow: `0 0 0 12px rgba(5, 150, 105, ${pulse})`,
        opacity,
      }}
    />
  )
}

const ModalFocus: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame()
  const focus = focusMap[scene.focus]
  const modalLeft = 470
  const modalTop = 90
  const localMap: Partial<Record<Scene['focus'], { x: number; y: number; w: number; h: number }>> =
    {
      image: { x: modalLeft + 24, y: modalTop + 176, w: 330, h: 58 },
      type: { x: modalLeft + 24, y: modalTop + 270, w: 932, h: 58 },
      difficulty: { x: modalLeft + 24, y: modalTop + 424, w: 400, h: 54 },
      statement: { x: modalLeft + 24, y: modalTop + 514, w: 932, h: 156 },
      answer: { x: modalLeft + 24, y: modalTop + 708, w: 540, h: 72 },
      preview: { x: modalLeft + 640, y: modalTop + 821, w: 180, h: 54 },
      save: { x: modalLeft + 836, y: modalTop + 821, w: 120, h: 54 },
    }
  const target = localMap[scene.focus] ?? focus

  if (!target || scene.focus === 'partial' || scene.focus === 'tab' || scene.focus === 'new') {
    return null
  }

  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.14, 0.4])
  return (
    <div
      style={{
        position: 'absolute',
        left: target.x,
        top: target.y,
        width: target.w,
        height: target.h,
        borderRadius: 14,
        border: `5px solid rgba(5, 150, 105, ${0.72 + pulse})`,
        boxShadow: `0 0 0 12px rgba(5, 150, 105, ${pulse})`,
      }}
    />
  )
}

const Cursor: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame()
  const target = focusMap[scene.focus]
  const x = target.x + target.w * 0.72
  const y = target.y + target.h * 0.64
  const clickScale = interpolate(Math.sin(frame / 5), [-1, 1], [0.95, 1.08])

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: `scale(${clickScale})`,
        filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.24))',
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '18px solid white',
          borderTop: '30px solid transparent',
          borderBottom: '8px solid transparent',
          transform: 'rotate(-18deg)',
        }}
      />
    </div>
  )
}

const Caption: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame()
  const local = frame - scene.start
  const opacity = interpolate(
    local,
    [0, 18, scene.end - scene.start - 18, scene.end - scene.start],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  )
  return (
    <div
      style={{
        position: 'absolute',
        left: 360,
        right: 360,
        bottom: 42,
        background: 'rgba(15, 23, 42, 0.9)',
        color: 'white',
        borderRadius: 16,
        padding: '22px 30px',
        fontSize: 26,
        lineHeight: 1.28,
        textAlign: 'center',
        fontWeight: 700,
        opacity,
      }}
    >
      {scene.caption}
    </div>
  )
}

const TitleCard: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = interpolate(frame, [0, 3750], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'absolute',
        right: 54,
        top: 126,
        width: 392,
        background: 'rgba(255,255,255,0.96)',
        border: `1px solid ${colors.line}`,
        borderRadius: 16,
        boxShadow: '0 16px 38px rgba(22,32,51,0.12)',
        padding: 24,
      }}
    >
      <div
        style={{ fontSize: 15, color: colors.green, fontWeight: 900, textTransform: 'uppercase' }}
      >
        Tutorial docente
      </div>
      <div
        style={{ fontSize: 32, color: colors.ink, fontWeight: 950, lineHeight: 1.06, marginTop: 8 }}
      >
        {scene.title}
      </div>
      <div style={{ fontSize: 19, color: colors.muted, fontWeight: 800, marginTop: 12 }}>
        {scene.subtitle}
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, marginTop: 22 }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: colors.green,
            borderRadius: 99,
          }}
        />
      </div>
      <div style={{ fontSize: 14, color: colors.muted, marginTop: 9, fontWeight: 700 }}>
        {Math.floor(frame / fps)}s / 125s
      </div>
    </div>
  )
}

export const TutorialVerdaderoFalso: React.FC = () => {
  const frame = useCurrentFrame()
  const scene = getScene(frame)
  const showModal = frame >= 1120 && frame < 3540

  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <Header />
      <Sidebar />
      <BankScreen scene={scene} />
      <TitleCard scene={scene} />
      <Focus scene={scene} />
      <Cursor scene={scene} />
      <Modal visible={showModal} scene={scene} />
      <Caption scene={scene} />
    </AbsoluteFill>
  )
}
