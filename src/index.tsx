import React, { useState, useLayoutEffect } from "react"
import { render } from "react-dom"
import styled, { createGlobalStyle } from "styled-components"
import { animated } from "react-spring"
import Tone from "tone"

const Container = styled.div`
  height: 100vh;
  background: black;
  color: white;
`
const Center = styled.div`
  display: grid;
  height: 100vh;
`
const CenterInner = styled.div`
  align-self: center;
  justify-self: center;
`

const Variable = styled.div`
  --size: 25vw;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: var(--size) var(--size);
  grid-template-rows: var(--size) var(--size);
  grid-gap: 5vw;
`
const CharBase = styled.div`
  font-size: var(--size);
  font-weight: bold;
  line-height: 1em;
  -webkit-text-stroke-width: 5px;
`

const Char = animated(CharBase)

const Global = createGlobalStyle`
body{

  margin:0;
  padding:0;
  box-sizing: border-box;
}
`
const synth = new Tone.NoiseSynth({
  noise: {
    type: "pink",
    playbackRate: 0.8
  },
  envelope: {
    attack: 0.01,
    decay: 1,
    sustain: 0
  }
}).toMaster()

// noise.connect(Tone.Master)

const App = () => {
  const [item, setItem] = useState<string[]>([])
  const text = "作戦完了"
  const chars = text.split("")
  useLayoutEffect(() => {
    const time = 250
    setTimeout(() => {
      const clear = setInterval(() => {
        setItem((i) => {
          if (!chars[i.length]) {
            clearInterval(clear) // TODO
            return i
          }
          return [...i, chars[i.length]]
        })
      }, time)
    }, time)
  }, [])
  useLayoutEffect(() => {
    if (item.length === 0) return
    // beep.play()
    synth.triggerAttack()
  }, [item])
  return (
    <Container>
      <Variable>
        <Global />
        <Center>
          <CenterInner>
            <Grid>
              {item.map((c) => (
                <Char key={c}>{c}</Char>
              ))}
            </Grid>
          </CenterInner>
        </Center>
      </Variable>
    </Container>
  )
}

render(<App />, document.querySelector("#root"))
