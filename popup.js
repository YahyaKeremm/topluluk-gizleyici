function updateList() {
    const ul = document.getElementById("commList");
    ul.innerHTML = "";

    chrome.storage.local.get("commList", (result) => {
        const commList = result.commList || [];
        
        // Tekrarlanan girişleri temizle
        const uniqueCommList = commList.filter((comm, index, self) =>
            index === self.findIndex((t) => t.id === comm.id)
        );

        if (uniqueCommList.length === 0) {
            ul.innerHTML = "<li style='padding: 10px; color: #536471;'>Henüz gizlenmiş topluluk yok</li>";
            return;
        }

        uniqueCommList.forEach(comm => {
            const li = document.createElement("li");
            li.style.cssText = `
                display: flex;
                flex-direction: column;
                padding: 8px;
                background: #f7f9f9;
                border-radius: 4px;
                margin-bottom: 8px;
            `;
            
            const nameSpan = document.createElement('span');
            nameSpan.style.color = '#0f1419';
            nameSpan.style.fontWeight = 'bold';
            nameSpan.textContent = comm.name;

            const idSpan = document.createElement('span');
            idSpan.style.color = '#536471';
            idSpan.style.fontSize = '12px';
            idSpan.textContent = `ID: ${comm.id}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&#x2715;';
            removeBtn.style.cssText = `
                align-self: flex-end;
                border: none;
                background: none;
                cursor: pointer;
                color: #f4212e;
                font-size: 14px;
                margin-top: -20px;
            `;

            removeBtn.addEventListener('click', () => {
                chrome.storage.local.get("commList", (result) => {
                    const updatedList = result.commList.filter(item => item.id !== comm.id);
                    chrome.storage.local.set({"commList": updatedList}, updateList);
                });
            });

            li.appendChild(nameSpan);
            li.appendChild(idSpan);
            li.appendChild(removeBtn);
            ul.appendChild(li);
        });
    });
}

// Listeyi Temizle butonu için event listener
document.getElementById('clearList')?.addEventListener('click', () => {
    if (confirm('Tüm gizlenmiş toplulukları kaldırmak istediğinize emin misiniz?')) {
        chrome.storage.local.set({"commList": []}, updateList);
    }
});

// Sayfa yüklendiğinde listeyi güncelle
document.addEventListener('DOMContentLoaded', updateList);
