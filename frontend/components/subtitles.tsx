import type { TokenizedSubtitleResponseDto } from "~api/apiSchemas"
import {usePlaybackSubtitle} from "~hooks/usePlaybackSubtitle";
import {SelectedSubtitle} from "~components/selected-subtitle";

export const Subtitles = (props: {
  parsedSubtitles: TokenizedSubtitleResponseDto[]
}) => {
    const subtitle = usePlaybackSubtitle(props.parsedSubtitles);
    return <SelectedSubtitle subtitle={subtitle}/>
}
