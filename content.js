var commList = [];

function loadList(callback) {
    chrome.storage.local.get("commList", (result) => {
        if (result.commList) {
            commList = result.commList;
            // console.log("Loaded commList: ", commList);
            callback();
        } else {
            // console.log("No data saved?");
            callback();
        }
    });
}

window.addEventListener("load", function () {
    loadList(hideTweets);
    const observer = new MutationObserver(() => {
        hideTweets();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

function hideTweets() {
    if (commList.length === 0) return;

    let hiddenCommunities = commList;

    let communityPosts = document.querySelectorAll(`[data-testid="tweet"]`);
    communityPosts.forEach(post => {
        hiddenCommunities.forEach(commId => {

            if (post.innerHTML.includes(commId)) {
                // console.log("Post matched community ID:", commId);
                if (["none"/*, "testing"*/].includes(post.closest('article').style.display)) return;
                // post.closest('article').style.border = "16px solid red"; // highlight for debugging
                post.closest('article').style.display = "none";
            }
        });
    });
}