import "./AppHeader.scss";
import { Text } from "@/shared/components";
import myLogo from "@/domain/images/logo.svg";

function AppHeader() {
  return (
    <div className="header">
      <a href="./" className="logo-and-title-container">
        <img src={myLogo} className="logo max-h-8" alt="App logo" />
        <Text className="text-white ml-2" fontSizeName="text-bigger">
          Simple Drawing App
        </Text>
      </a>
    </div>
  );
}

export default AppHeader;
