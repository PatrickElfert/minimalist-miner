import type { TokenizedSubtitleResponseDto } from "~api/apiSchemas"

export const SelectedSubtitle = (props: {
  subtitle: TokenizedSubtitleResponseDto
}) => {
  return (
    <div
      style={{
        fontSize: "28px",
        background: "black",
        opacity: 0.5,
        bottom: 0,
        display: "flex"
      }}>
      {props.subtitle?.tokens?.map((token, index) => (
        <div
          key={index}
          style={{
            zIndex: 99999
          }}>
          {token?.text}
        </div>
      ))}
    </div>
  )
}
