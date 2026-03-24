import React from "react";
import { Composition } from "remotion";
import { DeepResearchAnimation } from "./DeepResearchAnimation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DeepResearch"
        component={DeepResearchAnimation}
        durationInFrames={356}
        fps={30}
        width={468}
        height={360}
      />
    </>
  );
};
