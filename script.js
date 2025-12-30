document.addEventListener("DOMContentLoaded", () => {
    // YouTube Latest Video Feature
    const latestVideoContainer = document.getElementById("latest-video");
    if (latestVideoContainer) {
        const CHANNEL_ID = "UCHZ5ShzneP6hEVYc9CKe2Jg";
        const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
        const CACHE_KEY = "craiko_latest_video";
        const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

        async function fetchLatestVideo() {
            // Show loading state immediately
            renderLoading();
            
            // Check cache first
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TTL) {
                        renderVideo(data);
                        return;
                    }
                }
            } catch (e) {
                try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
            }

            try {
                // Try multiple CORS proxies as fallbacks
                const proxies = [
                    `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}`,
                    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(RSS_URL)}`,
                    `https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`
                ];
                
                let response = null;
                let xmlText = null;
                
                for (const proxyUrl of proxies) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);
                        response = await fetch(proxyUrl, { signal: controller.signal });
                        clearTimeout(timeoutId);
                        if (response.ok) {
                            let text = await response.text();
                            // Handle allorigins JSON wrapper
                            if (proxyUrl.includes("allorigins.win/get")) {
                                try {
                                    const json = JSON.parse(text);
                                    text = json.contents || "";
                                } catch (e) {}
                            }
                            if (text && text.includes("<entry>")) {
                                xmlText = text;
                                break;
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!xmlText || !xmlText.includes("<entry>")) throw new Error("Failed to fetch feed");
                
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "application/xml");
                
                const entries = xmlDoc.querySelectorAll("entry");
                if (entries.length === 0) throw new Error("No videos found");
                
                const firstEntry = entries[0];
                const title = firstEntry.querySelector("title")?.textContent || "New Video";
                const link = firstEntry.querySelector("link")?.getAttribute("href") || "#";
                const published = firstEntry.querySelector("published")?.textContent || "";
                // Handle namespaced videoId element (yt:videoId)
                let videoId = firstEntry.querySelector("videoId")?.textContent || "";
                if (!videoId) {
                    // Try getting from the yt:videoId with namespace
                    const videoIdEl = firstEntry.getElementsByTagName("yt:videoId")[0];
                    videoId = videoIdEl?.textContent || "";
                }
                // Fallback: extract from link if still empty
                if (!videoId && link) {
                    const match = link.match(/[?&]v=([^&]+)/);
                    if (match) videoId = match[1];
                }
                const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
                
                const videoData = { title, link, published, thumbnail, videoId };
                
                // Cache the result
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: videoData,
                    timestamp: Date.now()
                }));
                
                renderVideo(videoData);
            } catch (error) {
                console.error("Failed to fetch latest video:", error);
                renderFallback();
            }
        }

        function renderVideo(video) {
            // Use safe DOM manipulation to prevent XSS
            latestVideoContainer.textContent = "";
            
            const card = document.createElement("a");
            card.className = "hero-video-card";
            card.href = video.link;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            
            const img = document.createElement("img");
            img.src = video.thumbnail;
            img.alt = video.title;
            img.loading = "eager";
            img.className = "hero-video-img";
            card.appendChild(img);
            
            const playIcon = document.createElement("div");
            playIcon.className = "hero-play-icon";
            playIcon.textContent = "▶";
            card.appendChild(playIcon);
            
            latestVideoContainer.appendChild(card);
        }

        function renderLoading() {
            latestVideoContainer.textContent = "";
            const loading = document.createElement("p");
            loading.className = "hero-fallback-text";
            loading.textContent = "loading latest video...";
            latestVideoContainer.appendChild(loading);
        }

        function renderFallback() {
            // Use safe DOM manipulation to prevent XSS - show channel link if video fails
            latestVideoContainer.textContent = "";
            
            const card = document.createElement("a");
            card.className = "hero-video-card hero-fallback";
            card.href = "https://www.youtube.com/@craiko678";
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            
            const text = document.createElement("p");
            text.className = "hero-fallback-text";
            text.textContent = "visit my youtube channel";
            card.appendChild(text);
            
            latestVideoContainer.appendChild(card);
        }

        fetchLatestVideo();
    }
    // Grab the existing timer element from your HTML
    const timerContainer = document.getElementById("date-time");
    if (!timerContainer) return; // Exit if the element isn't found

    async function updateDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const defaultVideo = "https://www.youtube.com/watch?v=K8yLk1wavRc&t=10s";
        let videoLink = defaultVideo;

        const label = `<a id="custom-message" href="${defaultVideo}" target="_blank" rel="noopener noreferrer">SUPER MARIO GALAXY 2 FOR NINTEDO SWITCH DAY 2 OUT NOW</a>`;

        timerContainer.innerHTML = `${day} ${month} ${year} ${hours}:${minutes}:${seconds} | ${label}`;
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // 3D Rotation for Blog Image (Desktop + Mobile Swipe Support)
    const blogImage3D = document.querySelector(".blog-3d");

    if (blogImage3D) {
        let blogDragging = false;
        let blogStartX = 0;
        let blogStartY = 0;
        let blogRotationX = 0;
        let blogRotationY = 0;
        let velocityX = 0;
        let velocityY = 0;
        let friction = 0.95;

        // Mouse Drag (For Desktop)
        blogImage3D.addEventListener("mousedown", (e) => {
            e.preventDefault();
            blogDragging = true;
            blogStartX = e.clientX;
            blogStartY = e.clientY;
            velocityX = 0;
            velocityY = 0;
            blogImage3D.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", (e) => {
            if (!blogDragging) return;

            const deltaX = e.clientX - blogStartX;
            const deltaY = e.clientY - blogStartY;
            blogStartX = e.clientX;
            blogStartY = e.clientY;

            velocityX = deltaX * 0.5;
            velocityY = deltaY * 0.5;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;
        });

        window.addEventListener("mouseup", () => {
            blogDragging = false;
            blogImage3D.style.cursor = "grab";
            requestAnimationFrame(applyMomentum);
        });

        // Touch Swipe (For Mobile, Prevents Scrolling)
        blogImage3D.addEventListener("touchstart", (e) => {
            e.preventDefault();
            blogStartX = e.touches[0].clientX;
            blogStartY = e.touches[0].clientY;
            velocityX = 0;
            velocityY = 0;
        });

        blogImage3D.addEventListener("touchmove", (e) => {
            e.preventDefault();
            let moveX = e.touches[0].clientX;
            let moveY = e.touches[0].clientY;
            let deltaX = moveX - blogStartX;
            let deltaY = moveY - blogStartY;

            velocityX = deltaX * 0.5;
            velocityY = deltaY * 0.5;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;

            blogStartX = moveX;
            blogStartY = moveY;
        });

        blogImage3D.addEventListener("touchend", () => {
            requestAnimationFrame(applyMomentum);
        });

        // Apply Momentum Effect (Keeps Rotation Going Smoothly)
        function applyMomentum() {
            if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;

            velocityX *= friction;
            velocityY *= friction;

            blogRotationY += velocityX;
            blogRotationX -= velocityY;

            blogImage3D.style.transform = `rotateX(${blogRotationX}deg) rotateY(${blogRotationY}deg)`;

            requestAnimationFrame(applyMomentum);
        }

        // Restrict scroll-blocking only to the 3D image
        blogImage3D.addEventListener("touchmove", (e) => {
            if (blogDragging) e.preventDefault();
        }, { passive: false });
    }
});