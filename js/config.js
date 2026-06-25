const API_URL =
  "https://musubi-online.musubi-202607.workers.dev";

let SESSION_ID =
  localStorage.getItem(
    "sessionId"
  );

if(!SESSION_ID){

  SESSION_ID =
    crypto.randomUUID();

  localStorage.setItem(
    "sessionId",
    SESSION_ID
  );

}