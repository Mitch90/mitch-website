'use strict';

import { selected, initDrag, dragElement, emptySelection } from "./utils.mjs";

(function () {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardDimension = Math.min(viewportWidth, viewportHeight) * 0.3;
    const margin = cardDimension / 2;
    const dimensionsArray = [margin, margin, viewportWidth - margin, viewportHeight - margin];
    const $cards = document.querySelectorAll('.project__card');
    const $projects = document.querySelectorAll('.projects__list a');
    let resizeTimer;
    // console.log(viewportWidth, viewportHeight);

    // get random points to throw the cards
    const sampleArray = makeSamples();

    $cards.forEach(function (card, i) {
        let randomRotation = Math.floor(Math.random() * 30) - 15;
        
        card.style.cssText = `left: ${sampleArray[i][0]}px; top: ${sampleArray[i][1]}px; transform: rotate(${randomRotation}deg) scale(1); transition-delay: ${i * .05}s`;

        card.addEventListener("touchstart", moveCard, false);
        card.addEventListener("mousedown", moveCard, false);
        card.addEventListener("mouseover", highlightProjectText, false);
        card.addEventListener("mouseleave", highlightProjectText, false);
    });

    document.ontouchmove = ev => {
        if (selected !== null) {
            document.querySelectorAll('.projects__list a').forEach(project => {
                project.classList.add("no--events");
            });
        }
        dragElement(ev);
    };
    document.ontouchend = ev => {
        document.querySelectorAll('.projects__list a').forEach(project => {
            project.classList.remove("no--events");
        });
        emptySelection(ev);
    };
    document.onmousemove = ev => {
        if (selected !== null) {
            document.querySelectorAll('.projects__list a').forEach(project => {
                project.classList.add("no--events");
            });
        }
        dragElement(ev);
    };
    document.onmouseup = ev => {
        document.querySelectorAll('.projects__list a').forEach(project => {
            project.classList.remove("no--events");
        });
        emptySelection(ev);
    };

    $projects.forEach(project => {
        project.addEventListener("mouseleave", reorderStack, false);
        project.addEventListener("mouseover", reorderStack, false);
    })

    // Credits to Chris Coyier https://css-tricks.com/snippets/jquery/done-resizing-event/ 
    window.onresize = function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            const newViewportWidth = window.innerWidth;
            const newViewportHeight = window.innerHeight;

            $cards.forEach(el => {
                const positionTop = +el.getAttribute('style').replace(/left:.*top: (.*)px; transform.*/, '$1');
                const positionLeft = +el.getAttribute('style').replace(/left: (.*)px; top.*/, '$1');
                
                if (newViewportWidth < positionLeft || newViewportHeight < positionTop) {
                    el.style.left = newViewportWidth < positionLeft ? `${newViewportWidth - 150}px` : `${positionLeft}px`;
                    el.style.top = newViewportHeight < positionTop ? `${newViewportHeight - 150}px` : `${positionTop}px`;
                }
            })

            const $int = document.getElementById('interaction');
            const $inf = document.getElementById('information');
            const $job = document.querySelector('nav h4');
            let intPosition = $int.getBoundingClientRect().left;
            let infPosition = $inf.getBoundingClientRect().left;
            $int.style.left = 0;
            $inf.style.left = 0;
            let distance = infPosition - intPosition;
            $job.onmouseenter = function () {
                $int.style.left = distance + 'px';
                $inf.style.left = -distance + 'px';
            };

        }, 250);
    }

    function moveCard(ev) {
        ev.preventDefault();
        initDrag(ev, ev.target, "home");
    }

    function makeSamples() {
        let newSamples = [...samples(dimensionsArray, $cards.length)];
        if (newSamples.length < $cards.length) {
            return makeSamples();
        } else {
            let excess = newSamples.length - $cards.length;
            if (excess > 0) {
                for (let i = 0; i < excess; i++) {
                    let randomNumber = Math.floor(Math.random() * newSamples.length);
                    newSamples.splice(randomNumber, 1);
                }
            }
            return newSamples;
        }

    }

    function highlightProjectText (ev) {
        let order = ev.target.getAttribute('data-order');
        let $project = document.querySelector(`.projects__list a[data-order='${order}']`);
        if (ev.type === "mouseover") {
            $project.classList.add('card--match');
        } else {
            $project.classList.remove('card--match');
        }
    }

    function reorderStack (ev) {
        let order = ev.target.getAttribute('data-order');
        let $card = document.querySelector(`.project__card[data-order='${order}']`);
        let rotation = $card.getAttribute('style').replace(/.*(rotate\(.*deg\)).*/, '$1');
        if (ev.type === "mouseover") {
            let parentEl = document.getElementById('home');
            $card.style.transform = `${rotation} scale(1.05)`;
            $card.classList.add('card--moving');
            parentEl.appendChild($card);
        } else {
            $card.style.transform = `${rotation} scale(1)`;
            $card.classList.remove('card--moving');
        }
    }
})();

// Based on https://observablehq.com/@mbostock/poisson-disk-sampling, credits to Mike Bostock
function* samples([x0, y0, x1, y1], n, k = 30) {
    const width = x1 - x0;
    const height = y1 - y0;
    const radius2 = width * height / (n * 1.5);
    const radius = Math.sqrt(radius2);
    const radius2_3 = 3 * radius2;
    const cellSize = radius * Math.SQRT1_2;
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid = new Array(gridWidth * gridHeight);
    const queue = [];

    // Pick the first sample.
    yield sample(Math.random() * width, Math.random() * height);

    // Pick a random existing sample from the queue.
    pick: while (queue.length) {
        const i = Math.random() * queue.length | 0;
        const parent = queue[i];

        // Make a new candidate between [radius, 2 * radius] from the existing sample.
        for (let j = 0; j < k; ++j) {
            const a = 2 * Math.PI * Math.random();
            const r = Math.sqrt(Math.random() * radius2_3 + radius2);
            const x = parent[0] + r * Math.cos(a);
            const y = parent[1] + r * Math.sin(a);

            // Accept candidates that are inside the allowed extent
            // and farther than 2 * radius to all existing samples.
            if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) {
                yield sample(x, y);
                continue pick;
            }
        }

        // If none of k candidates were accepted, remove it from the queue.
        const r = queue.pop();
        if (i < queue.length) queue[i] = r;
    }

    function far(x, y) {
        const i = x / cellSize | 0;
        const j = y / cellSize | 0;
        const i0 = Math.max(i - 2, 0);
        const j0 = Math.max(j - 2, 0);
        const i1 = Math.min(i + 3, gridWidth);
        const j1 = Math.min(j + 3, gridHeight);
        for (let j = j0; j < j1; ++j) {
            const o = j * gridWidth;
            for (let i = i0; i < i1; ++i) {
                const s = grid[o + i];
                if (s) {
                    const dx = s[0] - x;
                    const dy = s[1] - y;
                    if (dx * dx + dy * dy < radius2) return false;
                }
            }
        }
        return true;
    }

    function sample(x, y, parent) {
        queue.push(grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = [x, y]);
        return [x + x0, y + y0];
    }
}
