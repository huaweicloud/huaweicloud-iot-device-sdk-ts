import * as mqtt from "mqtt";
import { createHmac } from "crypto";
import { TimeUtil } from "./time-util";

export class DeviceClient {
  private client: mqtt.MqttClient | null = null;

  constructor(
    private protocol: string,
    private host: string,
    private port: number,
    private deviceId: string,
    private secret: string,
    private keepAlivePeriod: number = 120,
    private disableTlsVerify: boolean = false,
    private disableHmacSha256Verify: boolean = false,
  ) {}

  private generateClientId(timestamp: string): string {
    const signatureType = this.disableHmacSha256Verify ? "0" : "1";
    return `${this.deviceId}_0_${signatureType}_${timestamp}`;
  }

  private generatePassword(timestamp: string): string {
    return createHmac("sha256", timestamp).update(this.secret).digest("hex");
  }

  async connect(): Promise<void> {
    const url = `${this.protocol}://${this.host}:${this.port}/mqtt`;
    const timestamp = TimeUtil.getTimestamp();
    const options: mqtt.IClientOptions = {
      keepalive: this.keepAlivePeriod,
      clientId: this.generateClientId(timestamp),
      username: this.deviceId,
      password: this.generatePassword(timestamp),
      protocolId: "MQTT",
      protocolVersion: 4,
      rejectUnauthorized: !this.disableTlsVerify,
    };
    this.client = mqtt.connect(url, options);

    return new Promise((resolve, reject) => {
      if (this.client) {
        this.client.on("connect", () => {
          resolve();
        });
        this.client.on("error", (err) => {
          reject(err);
        });
      } else {
        reject(new Error("Failed to initialize MQTT client."));
      }
    });
  }

  async reportDeviceMessage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any,
    objectDeviceId?: string,
    name?: string,
    id?: string,
  ): Promise<void> {
    if (!this.client) {
      throw new Error("Client is not connected.");
    }
    objectDeviceId = objectDeviceId || this.deviceId;
    const topic = `$oc/devices/${objectDeviceId}/sys/messages/up`;
    const messagePayload = {
      ...(name && { name }),
      ...(id && { id }),
      content: typeof content === "string" ? content : JSON.stringify(content),
    };
    this.client.publish(topic, JSON.stringify(messagePayload), { qos: 1 });
  }

  async disconnect(): Promise<void> {
    this.client?.end();
  }
}
