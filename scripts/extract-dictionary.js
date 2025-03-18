import fs from "node:fs";
import path from "node:path";

import es from "dictionary-es";

fs.writeFileSync(
  path.join(process.cwd(), "src/app/assets/dictionary.json"),
  JSON.stringify({
    aff: es.aff.toString("base64"),
    dic: es.dic.toString("base64"),
  })
);
