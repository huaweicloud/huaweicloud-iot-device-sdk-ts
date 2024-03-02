import { DeviceClient } from "../src";

async function main() {
  const deviceClient = new DeviceClient(
    "wss",
    "iot-mqtts.cn-north-4.myhuaweicloud.com",
    443,
    "",
    "",
    120,
    true,
    false,
  );

  await deviceClient.connect();
  console.log("Connected to the IoT platform.");

  await deviceClient.reportDeviceMessage(
    { temperature: 25 },
    undefined,
    "temperature",
    "123",
  );
  console.log("Reported device message.");

  await deviceClient.disconnect();
  console.log("Disconnected from the IoT platform.");
}

main().catch((err) => {
  console.error("An error occurred:", err);
});
