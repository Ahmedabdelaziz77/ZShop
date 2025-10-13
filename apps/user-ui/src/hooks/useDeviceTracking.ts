"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState("");

  useEffect(() => {
    const parser = new UAParser();
    const res = parser.getResult();

    setDeviceInfo(
      `${res.device.type || "Desktop"} - ${res.os.name} ${res.os.version} - ${
        res.browser.name
      } ${res.browser.version}`
    );
  }, [deviceInfo]);

  return deviceInfo;
};

export default useDeviceTracking;
