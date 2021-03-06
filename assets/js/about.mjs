'use strict';

import { selected, initDrag, dragElement, emptySelection } from "./utils.mjs";

(function () {
    let $interests = document.querySelector('.interests');
    let $interestsCard = document.querySelector('.card__interests');
    let $plans = document.querySelector('.plans');
    let $plansCard = document.querySelector('.card__plans');
    const $cards = document.querySelectorAll('.about__card');
    let resizeTimer;

    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        console.log('Safari is a terrible browser, please also check out my portfolio in either Chrome or Firefox');
        $interestsCard.style.display = 'none';
        $plansCard.style.display = 'none';
    }

    calculateMask($interests, $interestsCard);
    calculateMask($plans, $plansCard);

    $cards.forEach(card => {
        card.addEventListener("touchstart", moveCard, false);
        card.addEventListener("mousedown", moveCard, false);
    })

    document.ontouchmove = function (ev) {
        dragElement(ev);
        if (selected !== null) {
            if (selected.el.id == 'interests') {
                calculateMask($interests, $interestsCard);
            } else {
                calculateMask($plans, $plansCard);
            }
        }
    };
    document.ontouchend = emptySelection;
    
    document.onmousemove = function (ev) {
        dragElement(ev);
        if (selected !== null) {
            if (selected.el.id == 'interests') {
                calculateMask($interests, $interestsCard);
            } else {
                calculateMask($plans, $plansCard);
            }
        }
    };
    document.onmouseup = emptySelection;

    // Credits to Chris Coyier https://css-tricks.com/snippets/jquery/done-resizing-event/ 
    window.onresize = function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $interests = document.querySelector('.interests');
            $interestsCard = document.querySelector('.card__interests');
            $plans = document.querySelector('.plans');
            $plansCard = document.querySelector('.card__plans');
            calculateMask($interests, $interestsCard);
            calculateMask($plans, $plansCard);

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

})();

function moveCard(ev) {
    ev.preventDefault();
    initDrag(ev, ev.target, "about");
}

function calculateMask($annotations, $card) {
    const annotationsDimensions = $annotations.getBoundingClientRect();
    const cardDimensions = $card.getBoundingClientRect();
    // console.log(annotationsDimensions, cardDimensions);
    const cardHorizontalLenght = $card.id == "interests" ? annotationsDimensions.height : annotationsDimensions.height / 2;
    const cardVerticalLenght = annotationsDimensions.height;
    const cardHorizontalDelta = cardVerticalLenght * Math.sin(10 * Math.PI / 180);
    const cardVerticalDelta = cardHorizontalLenght * Math.sin(10 * Math.PI / 180);

    const cardX1 = cardDimensions.x + cardHorizontalDelta;
    const cardY1 = cardDimensions.y;
    const cardX2 = cardDimensions.right;
    const cardY2 = cardDimensions.y + cardVerticalDelta;
    const cardX3 = cardDimensions.right - cardHorizontalDelta;
    const cardY3 = cardDimensions.bottom;
    const cardX4 = cardDimensions.x;
    const cardY4 = cardDimensions.bottom - cardVerticalDelta;

    const maskX1 = round(cardX1 - annotationsDimensions.x, 0);
    const maskY1 = round(cardY1 - annotationsDimensions.y, 0);
    const maskX2 = round(cardX2 - annotationsDimensions.x, 0);
    const maskY2 = round(cardY2 - annotationsDimensions.y, 0);
    const maskX3 = round(cardX3 - annotationsDimensions.x, 0);
    const maskY3 = round(cardY3 - annotationsDimensions.y, 0);
    const maskX4 = round(cardX4 - annotationsDimensions.x, 0);
    const maskY4 = round(cardY4 - annotationsDimensions.y, 0);
    // console.log(annotationsDimensions.y, cardY2);

    $annotations.style.clipPath = `polygon(${maskX1}px ${maskY1}px, ${maskX2}px ${maskY2}px, ${maskX3}px ${maskY3}px, ${maskX4}px ${maskY4}px)`;

}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}