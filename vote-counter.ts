import axios from "axios";

(async () => {
  const { data } = await axios.get("https://api.example.com/vote-count");
  console.log(data);
})();
