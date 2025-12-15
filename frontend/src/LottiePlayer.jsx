import Lottie from "lottie-react";
import catLoader from "./assets/animations/car2.json";

const CatLoader = () => {
  if (!catLoader) return null; // prevents crash if JSON not loaded

  return (
    <div style={{ width: 300, height: 300, margin: "auto" }}>
      <Lottie animationData={catLoader} loop={true} />
    </div>
  );
};

export default CatLoader;
