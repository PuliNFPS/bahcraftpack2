import fs from 'fs';

// Caminho para o seu arquivo distribution.json
const caminhoJson = './distribution.json';

try {
    // 1. Lê o JSON que o Nebula acabou de gerar
    const json = JSON.parse(fs.readFileSync(caminhoJson, 'utf8'));

    // 2. O bloco do seu mod gigante (Cataclysm)
    const modCataclysm = {
        "id": "l_enders_cataclysm-3.16",
        "name": "L_Enders_Cataclysm-3.16.jar",
        "type": "ForgeMod",
        "artifact": {
            "size": 127986000,
            "url": "https://drive.google.com/uc?export=download&id=1r00As-hxIcM4v1V-17Gz1bKWlVCD84VT&confirm=t",
            "path": "forgemods/required/L_Enders_Cataclysm-3.16.jar"
        }
    };

    // 3. Procura o seu servidor (geralmente é o primeiro da lista, índice 0)
    const servidor = json.servers[0]; 

    // 4. Verifica se o mod já não está lá para não duplicar
    const jaExiste = servidor.modules.some(mod => mod.name === modCataclysm.name);

    if (!jaExiste) {
        // Injeta o mod na lista
        servidor.modules.push(modCataclysm);
        
        // Salva o arquivo modificado
        fs.writeFileSync(caminhoJson, JSON.stringify(json, null, 4));
        console.log("💉 Sucesso: Mod Cataclysm injetado no distribution.json!");
    } else {
        console.log("⚡ O Cataclysm já estava no arquivo.");
    }

} catch (erro) {
    console.error("❌ Erro ao injetar o mod:", erro.message);
}