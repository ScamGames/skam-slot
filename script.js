(function () {
  "use strict";

  const items = [
    "./images/img1.png",
    "./images/img2.png",
    "./images/img3.png",
    "./images/img4.png",
  ];

  let wins = 0;

  const doors = document.querySelectorAll(".door");
  document.querySelector("#spinner").addEventListener("click", spin);
  document.querySelector("#reseter").addEventListener("click", init);

  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 69,
      scalar: 1.2,
      shapes: ["star"],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }

  async function spin() {
    init(false, 1, 2);
    for (const door of doors) {
      const boxes = door.querySelector(".boxes");
      const duration = parseInt(boxes.style.transitionDuration);
      boxes.style.transform = "translateY(0)";
      await new Promise((resolve) => setTimeout(resolve, duration * 100));
    }
    checkWin();
  }

  function init(firstInit = true, groups = 1, duration = 1) {
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = "0";
      } else if (door.dataset.spinned === "1") {
        return;
      }

      const boxes = door.querySelector(".boxes");
      const boxesClone = boxes.cloneNode(false);

      let pool = [];
      if (!firstInit) {
        const uniqueShuffledItems = shuffle([...items]); // Shuffle a new array for each door
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          pool.push(...uniqueShuffledItems); // Use shuffled items
        }

        boxesClone.addEventListener(
          "transitionstart",
          function () {
            door.dataset.spinned = "1";
            this.querySelectorAll(".box img").forEach((img) => {
              img.style.filter = "blur(1px)";
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          "transitionend",
          function () {
            this.querySelectorAll(".box img").forEach((img, index) => {
              img.style.filter = "blur(0)";
              if (index > 0) img.parentElement.remove();
            });
          },
          { once: true }
        );
      } else {
        pool = [...items];
      }

      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.style.width = door.clientWidth + "px";
        box.style.height = door.clientHeight + "px";

        const img = document.createElement("img");
        img.src = pool[i];
        img.alt = `Image ${i}`;
        img.style.width = "69%";
        img.style.height = "92%";
        img.style.objectFit = "cover";

        box.appendChild(img);
        boxesClone.appendChild(box);
      }

      boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
      boxesClone.style.transform = `translateY(-${
        door.clientHeight * (pool.length - 1)
      }px)`;
      door.replaceChild(boxesClone, boxes);
    }
  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }

  async function checkWin() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const visibleImages = [];
    for (const door of doors) {
      const box = door.querySelector(".boxes .box:first-child img");
      visibleImages.push(box.src); // Collect the src of the first visible image
    }

    const allEqual = visibleImages.every((src) => src === visibleImages[0]);

    if (allEqual) {
      // Play win sound
      console.log("pre", wins);
      wins++;
      console.log("after", wins);

      document.querySelector(".info").textContent = `Highest Score: ${wins}`;
      if (wins >= 2) {
        const winSound = new Audio("./sounds/win-sound-2.mp3");
        winSound.play();
      } else {
        const winSound = new Audio("./sounds/win-sound-1.mp3");
        winSound.play();
      }

      // Play win confetti
      shoot();
    } else {
      wins = 0;

      document.querySelector(".info").textContent = `Highest Score: ${wins}`;
      const winSound = new Audio("./sounds/lose-sound.mp3");
      winSound.play();
      console.log("Try again! 🚀");
    }
  }

  init();
})();
