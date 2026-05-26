import React from 'react'
import { Composition } from 'remotion'
import { TutorialVerdaderoFalso } from './tutorial-verdadero-falso'

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TutorialVerdaderoFalso"
      component={TutorialVerdaderoFalso}
      durationInFrames={3750}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  )
}
