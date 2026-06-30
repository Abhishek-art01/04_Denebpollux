import client from "./client.js";

export async function wakeAuth() {
  const { data } = await client.get("/wake", {
    params: { target: "auth" },
    timeout: 75000,
    wakeRetry: true,
  });
  return data;
}

export async function wakeClient(clientId) {
  const { data } = await client.get("/wake", {
    params: { target: "client", client_id: clientId },
    timeout: 75000,
    wakeRetry: true,
  });
  return data;
}
