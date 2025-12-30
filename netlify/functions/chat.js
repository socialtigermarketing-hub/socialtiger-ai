export default async (req) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (req.method !== "POST") {
    return new Response("Only POST allowed", { status: 405 });
  }

  const body = await req.json();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: body.messages
    })
  });

  return new Response(await response.text(), {
    headers: { "Content-Type": "application/json" }
  });
};
