function addBlockButtonToProfile() {
    // Eğer buton zaten varsa tekrar ekleme
    if (document.querySelector('.block-community-btn')) return;

    // Katıldı butonunun container'ını bul
    const joinButtonContainer = document.querySelector('div.css-175oi2r.r-16e1t0z');
    if (!joinButtonContainer) return;

    // Topluluk adını bul - güncellenmiş seçici
    const getCommunityName = () => {
        const possibleSelectors = [
            '.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-1yjpyg1.r-ueyrd6.r-b88u0q',
            '[style*="color: rgb(231, 233, 234)"] .css-1jxf684',
            'div.css-175oi2r.r-18u37iz.r-labphf span.css-1jxf684'
        ];

        for (const selector of possibleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element.textContent.trim();
            }
        }
        
        return 'Bilinmeyen Topluluk';
    };

    const communityName = getCommunityName();
    const communityId = window.location.pathname.match(/\/(?:i\/)?communities\/([^/]+)/)?.[1];
    
    if (!communityId) return;

    const communityData = {
        name: communityName,
        id: communityId
    };

    // Engelle butonu oluştur
    const blockBtn = document.createElement('button');
    blockBtn.className = 'block-community-btn';
    blockBtn.style.cssText = `
        margin-left: 12px;
        background: none;
        border: 1px solid #536471;
        border-radius: 9999px;
        cursor: pointer;
        padding: 4px 16px;
        font-size: 15px;
        font-weight: bold;
        color: #F4212E;
        height: 32px;
        line-height: 20px;
        white-space: nowrap;
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
    `;

    // Butonun durumunu kontrol et
    chrome.storage.local.get(['commList'], function(result) {
        const commList = result.commList || [];
        const existingComm = commList.find(comm => comm.id === communityData.id);
        
        blockBtn.innerText = existingComm ? 'Engeli Kaldır' : 'Engelle';
        if (existingComm) {
            blockBtn.style.backgroundColor = '#536471';
            blockBtn.style.color = '#fff';
        }
    });

    blockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        chrome.storage.local.get(['commList'], function(result) {
            let commList = result.commList || [];
            const existingComm = commList.find(comm => comm.id === communityData.id);
            
            if (existingComm) {
                commList = commList.filter(comm => comm.id !== communityData.id);
                chrome.storage.local.set({commList: commList}, function() {
                    blockBtn.innerText = 'Engelle';
                    blockBtn.style.backgroundColor = 'transparent';
                    blockBtn.style.color = '#F4212E';
                });
            } else {
                if (confirm(`"${communityData.name}" topluluğunu gizlemek istediğinize emin misiniz?`)) {
                    commList.push(communityData);
                    chrome.storage.local.set({commList: commList}, function() {
                        blockBtn.innerText = 'Engeli Kaldır';
                        blockBtn.style.backgroundColor = '#536471';
                        blockBtn.style.color = '#fff';
                        hideTweets();
                    });
                }
            }
        });
    });

    // Butonu doğru konuma ekle
    joinButtonContainer.insertAdjacentElement('afterend', blockBtn);
}

// Tweet gizleme fonksiyonu - tüm sayfalar için
function hideTweets() {
    try {
        const tweets = document.querySelectorAll('[data-testid="tweet"], [data-testid="like"]');
        tweets.forEach(tweet => {
            try {
                const communityLink = tweet.querySelector('a[href*="communities"]');
                if (communityLink) {
                    const communityId = communityLink.href.match(/\/communities\/([^/]+)/)?.[1];
                    if (communityId) {
                        chrome.storage.local.get(['commList'], function(result) {
                            const commList = result.commList || [];
                            if (commList.some(comm => comm.id === communityId)) {
                                tweet.style.display = 'none';
                            }
                        });
                    }
                }
            } catch (err) {
                console.log('Tweet işleme hatası:', err);
            }
        });
    } catch (err) {
        console.log('Tweet gizleme hatası:', err);
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    addBlockButtonToProfile();
    hideTweets();
});

// URL değişikliklerini izle
let lastUrl = location.href;
setInterval(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
            addBlockButtonToProfile();
            hideTweets();
        }, 1000);
    }
}, 500);

// DOM değişikliklerini izle
const observer = new MutationObserver(() => {
    addBlockButtonToProfile();
    hideTweets();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});