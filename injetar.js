import fs from 'fs';

const caminhoJson = './distribution.json';

try {
    const json = JSON.parse(fs.readFileSync(caminhoJson, 'utf8'));


    // O bloco do Cataclysm com o ID no formato MAVEN (grupo:nome:versao@jar)
    const modCataclysm = {
        "id": "l_enders:cataclysm:3.16@jar", 
        "name": "L_Enders_Cataclysm-3.16.jar",
        "type": "ForgeMod",
        "artifact": {
            "size": 127993805,
            "MD5": "de747fb259b761f7b872654516fa27b3",
            "url": "https://www.dropbox.com/scl/fi/roxdpwzxq3ivx97pt848u/L_Enders_Cataclysm-3.16.jar?rlkey=cjh94ompwcx69dznh6wjk5r9z&st=d18rmuse&dl=1",
        }
    };

    const servidor = json.servers[0];
    
    servidor.modules = servidor.modules.filter(mod => mod.name !== modCataclysm.name);
    
    let indexParaInserir = servidor.modules.length;
    for (let i = 0; i < servidor.modules.length; i++) {
        if (servidor.modules[i].type === 'File') {
            indexParaInserir = i;
            break;
        }
    }

    servidor.modules.splice(indexParaInserir, 0, modCataclysm);
    
    fs.writeFileSync(caminhoJson, JSON.stringify(json, null, 4));
    console.log("💉 Sucesso: Cataclysm injetado (agora com ID Maven válido!)");

} catch (erro) {
    console.error("❌ Erro ao processar o JSON:", erro.message);
}