import React, {
  useState,
  useLayoutEffect,
  createContext,
  useContext
} from "react"
import { render } from "react-dom"
import styled, { css, createGlobalStyle, keyframes } from "styled-components"
import { animated } from "react-spring"
import Tone from "tone"
// import qs from "querystring"
import URL from "url"
const Container = styled.div`
  height: 100vh;
  background: black;
  color: white;
`

const Star = styled.div`
  width: 2px;
  height: 2px;
  /* opacity: 0.9; */
  background: white;
  position: fixed;
  ${({ top, left }) => css`
    top: ${top}vh;
    left: ${left}vw;
  `}
`
const rotate = keyframes`
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
`

const Sky = styled.div`
  position: fixed;
  /*
  animation: ${rotate};
  animation-duration: 120s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  */
  /* transform: rotateZ() */
`
const Stars = () => {
  const [pos] = useState(
    Array(60)
      .fill(null)
      .map((_) => [Math.random(), Math.random()])
  )
  return (
    <Sky>
      {pos.map(([t, l], i) => (
        // <Star top={t * 250 - 100} left={l * 250 - 100} key={i} />
        <Star top={t * 100} left={l * 100} key={i} />
      ))}
    </Sky>
  )
}
const Center = styled.div`
  display: grid;
  height: 100vh;
`
const CenterInner = styled.div`
  align-self: center;
  justify-self: center;
`

const Variable = styled.div`
  --font-size: 10em;
  --char-pad: 10px;
  --size: calc(var(--font-size) + var(--char-pad) * 2);
`

const OverGrid = styled.div`
  grid-template-rows: max-content var(--size);
`
const CharGrid = styled.div`
  display: grid;
  grid-template-columns: var(--size) var(--size);
  grid-template-rows: var(--size) var(--size);
  /* grid-gap: 2em; */
`
const BgItem = styled.div`
  background: linear-gradient(
    0deg,
    rgba(11, 20, 46, 0.3),
    rgba(39, 75, 179, 0.3)
  );
`
const CharBase = styled.div`
  font-size: var(--font-size);
  font-weight: bold;
  line-height: 1em;
  padding: var(--char-pad);
  -webkit-text-stroke-width: 5px;
`
const Header = styled.div`
  ${({ children }) => {
    const len = children.length
    return css`
      font-size: 2em;
      /* ${100 / len}%; */
    `
  }}
  font-weight: bold;
  width: 100%;
  grid-column: span 2;
  letter-spacing: 0.3em;
  text-align: center;
`
const Global = createGlobalStyle`
body{

  margin:0;
  padding:0;
  box-sizing: border-box;
  font-family: "Hiragino Kaku Gothic ProN","メイリオ", sans-serif;
}
`

const SoundContext = createContext<any | null>(null)
const Sound = ({ children }) => {
  const distortion = new Tone.Distortion(0.2)
  const effect = new Tone.Effect(0.5)
  // const phase = new Tone.Phaser(0.5, -10)
  const cheby = new Tone.Chebyshev(50)
  const chorus = new Tone.Chorus(2)
  // const pitch = new Tone.PitchShift(-10)
  // const tremolo = new Tone.Tremolo().start()

  const synth = new Tone.NoiseSynth({
    noise: {
      type: "pink",
      playbackRate: 0.05
    },
    envelope: {
      attack: 0.02,
      decay: 0.7,
      sustain: 0
    }
  }).chain(
    distortion,
    // effect,
    cheby,
    // chorus,
    // pitch,
    // phase,
    // tremolo,
    Tone.Master
  )
  return <SoundContext.Provider value={synth}>{children}</SoundContext.Provider>
}

const useSynth = () => {
  const synth = useContext(SoundContext)
  useLayoutEffect(() => {
    if (!synth) {
      return
    }
    // synth.sync()
    synth.triggerAttackRelease()
    // synth.triggerAttackRelease("2n")
    // synth.triggerAttackRelease("8n")
    // synth.triggerAttackRelease("8n", "8n")
    // synth.triggerAttackRelease("8n", "4n")
    // Tone.Transport.start()
  }, [synth])
}

const Char = ({ children }) => {
  useSynth()
  return <CharBase>{children}</CharBase>
}

const PreloadCenter = styled.div`
  text-align: center;
  color: gray;
`
const Preload = () => (
  <PreloadCenter>
    <h2>Click to play</h2>
    <div>(音が出ます)</div>
  </PreloadCenter>
)

const App = () => {
  const [item, setItem] = useState<string[]>([])
  const [start, setStart] = useState<boolean>(false)
  const [startPre, setStartPre] = useState<boolean>(false)
  // console.log(qs.parse(location.search))
  // console.log(location)
  const { query } = URL.parse(location.href, true)
  const headerText = query.header || "作戦No. 1"
  const text =
    (Array.isArray(query.text) ? query.text[0] : query.text) || "作戦完了"
  const chars = text.split("")
  useLayoutEffect(() => {
    if (!start) {
      return
    }
    const startTime = 240 * 2
    const time = 240
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
    }, startTime)
  }, [start])

  return (
    <Container
      onClick={(e) => {
        setStartPre(true)
        setTimeout(() => setStart(true), 240)
      }}
      // onTap={(e) => setStart(true)}
      // onMouseOver={(e) => setStart(true)}
    >
      <Global />
      <Center>
        <Stars />
        <CenterInner>
          <Variable>
            {startPre ? (
              start && (
                <Sound>
                  <OverGrid>
                    <BgItem>
                      <Header>{headerText}</Header>
                    </BgItem>
                    <CharGrid>
                      {item.map((c) => (
                        <BgItem key={c}>
                          <Char>{c}</Char>
                        </BgItem>
                      ))}
                    </CharGrid>
                  </OverGrid>
                </Sound>
              )
            ) : (
              <Preload />
            )}
          </Variable>
        </CenterInner>
      </Center>
    </Container>
  )
}

render(<App />, document.querySelector("#root"))
