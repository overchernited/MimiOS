import gsap from "gsap";

export const PopIn = (node: HTMLElement) => {
    gsap.fromTo(node,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
    );
    return { duration: 350 };
};

export const PopOut = (node: HTMLElement) => {
    gsap.to(node, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
    });
    return { duration: 250 };
};

export const SlideUpIn = (node: HTMLElement) => {
    gsap.fromTo(node,
        { y: 80, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
    return { duration: 500 };
};

export const SlideUpOut = (node: HTMLElement) => {
    gsap.to(node, {
        y: 80,
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in"
    });
    return { duration: 300 };
};

export const TopFadeIn = (node: HTMLElement) => {
    gsap.set(node, { opacity: 0, y: -20 });
    gsap.to(node, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    return { duration: 300 };
};

export const BottomFadeOut = (node: HTMLElement) => {
    gsap.set(node, { opacity: 1, y: 0 });
    gsap.to(node, { opacity: 0, y: 100, duration: 0.2, ease: "power1.out" });
    return { duration: 200 };
};

export const BellVibrate = (node: HTMLElement) => {
    const tl = gsap.timeline();
    tl.to(node, { rotation: 15, duration: 0.08, ease: "power1.inOut" })
      .to(node, { rotation: -15, duration: 0.08, ease: "power1.inOut" })
      .to(node, { rotation: 10, duration: 0.08, ease: "power1.inOut" })
      .to(node, { rotation: -10, duration: 0.08, ease: "power1.inOut" })
      .to(node, { rotation: 0, duration: 0.1, ease: "power2.out" });
};
