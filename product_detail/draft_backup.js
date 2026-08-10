import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';


/* =========================================================
   BASIC
========================================================= */

const canvas =
    document.getElementById('scene');

const hint =
    document.getElementById('hint');


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    0.82;


/* =========================================================
   SCENE
========================================================= */

const scene =
    new THREE.Scene();


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        35,
        window.innerWidth /
        window.innerHeight,
        0.1,
        100
    );


camera.position.set(
    0,
    0,
    5.9
);


camera.lookAt(
    0,
    0,
    0
);


/* =========================================================
   ENVIRONMENT
========================================================= */

const pmrem =
    new THREE.PMREMGenerator(
        renderer
    );


scene.environment =
    pmrem
        .fromScene(
            new RoomEnvironment(),
            0.04
        )
        .texture;


/* =========================================================
   LIGHT
========================================================= */

const key =
    new THREE.DirectionalLight(
        0xfff6ea,
        0.85
    );


key.position.set(
    2.6,
    4.2,
    4
);


scene.add(
    key
);


const rim =
    new THREE.DirectionalLight(
        0xffe6c4,
        0.55
    );


rim.position.set(
    -4,
    1.6,
    -2.6
);


scene.add(
    rim
);


scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.3
    )
);


/* =========================================================
   BOTTLE BASIC
========================================================= */

const H =
    1.95;


const V_SPAN =
    0.905;


const SEG =
    192;


/* =========================================================
   BODY PROFILE
========================================================= */

const BODY_PROFILE = [

    [0.085, 0.1414],
    [0.1035, 0.1437],
    [0.1219, 0.1451],
    [0.1404, 0.1454],

    [0.1588, 0.1446],
    [0.1773, 0.1447],
    [0.1957, 0.1448],
    [0.2142, 0.1449],

    [0.2326, 0.1450],
    [0.2511, 0.1451],
    [0.2695, 0.1452],
    [0.2880, 0.1452],

    [0.3065, 0.1452],
    [0.3249, 0.1452],
    [0.3434, 0.1454],
    [0.3618, 0.1455],

    [0.3803, 0.1455],
    [0.3987, 0.1457],
    [0.4172, 0.1458],
    [0.4356, 0.1458],

    [0.4541, 0.1459],
    [0.4725, 0.1459],
    [0.4910, 0.1459],
    [0.5095, 0.1459],

    [0.5279, 0.1460],
    [0.5464, 0.1461],
    [0.5648, 0.1460],
    [0.5833, 0.1457],

    [0.6017, 0.1443],
    [0.6202, 0.1419],
    [0.6386, 0.1388],
    [0.6571, 0.1348],

    [0.6755, 0.1299],
    [0.6940, 0.1243],
    [0.7125, 0.1176],
    [0.7309, 0.1098],

    [0.7494, 0.1011],
    [0.7678, 0.0916],
    [0.7863, 0.0818],
    [0.8047, 0.0730],

    [0.8232, 0.0655],
    [0.8416, 0.0595],
    [0.8601, 0.0556],
    [0.8785, 0.0534],

    [0.8970, 0.0523],
    [0.9110, 0.0521],
    [0.9210, 0.0518]

];


/* =========================================================
   FOOT PROFILE
========================================================= */

const FOOT_PROFILE = [

    [0.085, 0.1414],
    [0.070, 0.1385],
    [0.055, 0.1330],
    [0.042, 0.1245],

    [0.030, 0.1130],
    [0.020, 0.0975],
    [0.012, 0.0790],
    [0.006, 0.0560],

    [0.002, 0.0300],
    [0.000, 0.0000]

];


const VALLEY_PROFILE = [

    [0.085, 0.1414],
    [0.076, 0.1330],
    [0.068, 0.1215],
    [0.062, 0.1070],

    [0.057, 0.0900],
    [0.053, 0.0715],
    [0.050, 0.0520],
    [0.048, 0.0330],

    [0.047, 0.0150],
    [0.047, 0.0000]

];


const FEET =
    8;


const v2 =
    ([u, r]) =>
        new THREE.Vector2(
            r * H,
            u * H
        );


/* =========================================================
   UV
========================================================= */

function heightUV(
    geo
) {

    const pos =
        geo.attributes.position;


    const uv =
        geo.attributes.uv;


    for (
        let i = 0;
        i < pos.count;
        i++
    ) {

        uv.setY(
            i,
            pos.getY(i) /
            (V_SPAN * H)
        );

    }


    uv.needsUpdate =
        true;


    return geo;

}


/* =========================================================
   LATHE
========================================================= */

function latheFrom(
    profile,
    segments = SEG
) {

    const geometry =
        new THREE.LatheGeometry(

            profile.map(v2),

            segments,

            -Math.PI,

            Math.PI * 2

        );


    geometry.computeVertexNormals();


    return geometry;

}


/* =========================================================
   SMOOTHSTEP
========================================================= */

function smoothstep(
    a,
    b,
    x
) {

    const t =
        Math.min(
            1,
            Math.max(
                0,
                (x - a) /
                (b - a)
            )
        );


    return (
        t *
        t *
        (3 - 2 * t)
    );

}


/* =========================================================
   PETALOID BASE
========================================================= */

function petaloidBase() {

    const rows =
        FOOT_PROFILE.length;


    const cols =
        SEG;


    const pos = [];
    const uv = [];
    const idx = [];


    for (
        let i = 0;
        i <= cols;
        i++
    ) {

        const phi =
            -Math.PI +
            (i / cols) *
            Math.PI *
            2;


        const w =
            smoothstep(

                0.18,

                0.92,

                0.5 +
                0.5 *
                Math.cos(
                    FEET *
                    phi
                )

            );


        for (
            let j = 0;
            j < rows;
            j++
        ) {

            const f =
                FOOT_PROFILE[j];


            const v =
                VALLEY_PROFILE[j];


            const u =
                v[0] +
                (
                    f[0] -
                    v[0]
                ) *
                w;


            const r =
                v[1] +
                (
                    f[1] -
                    v[1]
                ) *
                w;


            pos.push(

                r *
                H *
                Math.sin(phi),

                u *
                H,

                r *
                H *
                Math.cos(phi)

            );


            uv.push(

                i / cols,

                u /
                V_SPAN

            );

        }

    }


    for (
        let i = 0;
        i < cols;
        i++
    ) {

        for (
            let j = 0;
            j < rows - 1;
            j++
        ) {

            const a =
                i *
                rows +
                j;


            const b =
                a +
                rows;


            idx.push(

                a,
                a + 1,
                b,

                b,
                a + 1,
                b + 1

            );

        }

    }


    const geometry =
        new THREE.BufferGeometry();


    geometry.setAttribute(

        'position',

        new THREE.Float32BufferAttribute(
            pos,
            3
        )

    );


    geometry.setAttribute(

        'uv',

        new THREE.Float32BufferAttribute(
            uv,
            2
        )

    );


    geometry.setIndex(
        idx
    );


    geometry.computeVertexNormals();


    return geometry;

}


/* =========================================================
   FLUTED CAP
========================================================= */

function flutedRing(
    u0,
    u1,
    r,
    ribs,
    amp,
    rows = 4
) {

    const cols =
        ribs *
        6;


    const pos = [];
    const idx = [];


    for (
        let i = 0;
        i <= cols;
        i++
    ) {

        const phi =
            -Math.PI +
            (i / cols) *
            Math.PI *
            2;


        const rr =
            r -
            amp *
            0.5 *
            (
                1 -
                Math.cos(
                    ribs *
                    phi
                )
            );


        for (
            let j = 0;
            j < rows;
            j++
        ) {

            const u =
                u0 +
                (
                    u1 -
                    u0
                ) *
                (
                    j /
                    (rows - 1)
                );


            pos.push(

                rr *
                H *
                Math.sin(phi),

                u *
                H,

                rr *
                H *
                Math.cos(phi)

            );

        }

    }


    for (
        let i = 0;
        i < cols;
        i++
    ) {

        for (
            let j = 0;
            j < rows - 1;
            j++
        ) {

            const a =
                i *
                rows +
                j;


            const b =
                a +
                rows;


            idx.push(

                a,
                b,
                a + 1,

                b,
                b + 1,
                a + 1

            );

        }

    }


    const geometry =
        new THREE.BufferGeometry();


    geometry.setAttribute(

        'position',

        new THREE.Float32BufferAttribute(
            pos,
            3
        )

    );


    geometry.setIndex(
        idx
    );


    geometry.computeVertexNormals();


    return geometry;

}


/* =========================================================
   FALLBACK LABEL
========================================================= */

function fallbackLabel() {

    const c =
        document.createElement(
            'canvas'
        );


    c.width =
        16;


    c.height =
        512;


    const g =
        c.getContext(
            '2d'
        );


    const grad =
        g.createLinearGradient(
            0,
            512,
            0,
            0
        );


    grad.addColorStop(
        0,
        '#9d7c52'
    );


    grad.addColorStop(
        0.53,
        '#a8875d'
    );


    grad.addColorStop(
        0.55,
        '#f0e6d5'
    );


    grad.addColorStop(
        0.8,
        '#f4ecdf'
    );


    grad.addColorStop(
        1,
        '#efe7da'
    );


    g.fillStyle =
        grad;


    g.fillRect(
        0,
        0,
        16,
        512
    );


    const texture =
        new THREE.CanvasTexture(
            c
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

}


/* =========================================================
   MATERIAL
========================================================= */

const bodyMat =
    new THREE.MeshPhysicalMaterial({

        color:
            0xffffff,

        roughness:
            0.34,

        metalness:
            0,

        clearcoat:
            0.55,

        clearcoatRoughness:
            0.12,

        envMapIntensity:
            0.4

    });


const capMat =
    new THREE.MeshPhysicalMaterial({

        color:
            0x15151a,

        roughness:
            0.36,

        metalness:
            0,

        clearcoat:
            0.75,

        clearcoatRoughness:
            0.18,

        envMapIntensity:
            1.1

    });


const petMat =
    new THREE.MeshPhysicalMaterial({

        color:
            0xffffff,

        transmission:
            0.92,

        thickness:
            0.05,

        ior:
            1.57,

        roughness:
            0.07,

        metalness:
            0,

        clearcoat:
            1,

        clearcoatRoughness:
            0.04,

        envMapIntensity:
            1.3,

        transparent:
            true,

        side:
            THREE.DoubleSide

    });


/* =========================================================
   LABEL TEXTURE
========================================================= */

new THREE.TextureLoader().load(

    './product_detail_asset/img/draft.png',

    texture => {

        texture.colorSpace =
            THREE.SRGBColorSpace;


        texture.wrapS =
            THREE.RepeatWrapping;


        texture.wrapT =
            THREE.ClampToEdgeWrapping;


        texture.anisotropy =
            renderer
                .capabilities
                .getMaxAnisotropy();


        bodyMat.map =
            texture;


        bodyMat.needsUpdate =
            true;

    },


    undefined,


    () => {

        console.warn(
            'draft.png 로드 실패'
        );


        bodyMat.map =
            fallbackLabel();


        bodyMat.needsUpdate =
            true;

    }

);


/* =========================================================
   BOTTLE
========================================================= */

const bottle =
    new THREE.Group();


const parts = [

    [
        'bottle-body',

        heightUV(
            latheFrom(
                BODY_PROFILE
            )
        ),

        bodyMat
    ],


    [
        'bottle-base',

        petaloidBase(),

        bodyMat
    ],


    [
        'neck-support-ring',

        latheFrom([

            [0.888, 0.0521],
            [0.8905, 0.0668],
            [0.8955, 0.0702],
            [0.9005, 0.0668],
            [0.9025, 0.0521]

        ], 128),

        petMat
    ],


    [
        'cap-tamper-band',

        latheFrom([

            [0.904, 0.0600],
            [0.906, 0.0674],
            [0.930, 0.0672],
            [0.933, 0.0642],
            [0.9365, 0.0628],
            [0.940, 0.0652]

        ], 128),

        capMat
    ],


    [
        'cap-knurl',

        flutedRing(
            0.940,
            0.9935,
            0.0652,
            64,
            0.0026,
            4
        ),

        capMat
    ],


    [
        'cap-crown',

        latheFrom([

            [0.9935, 0.0652],
            [0.997, 0.0634],
            [0.9992, 0.0556],
            [1, 0.0400],
            [1, 0]

        ], 128),

        capMat
    ]

];


/* =========================================================
   CREATE BOTTLE
========================================================= */

parts.forEach(
    (
        [
            name,
            geometry,
            material
        ]
    ) => {

        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );


        mesh.name =
            name;


        bottle.add(
            mesh
        );

    }
);


/* =========================================================
   BOTTLE PIVOT
========================================================= */

bottle.children.forEach(
    mesh => {

        mesh.position.y -=
            H *
            0.5;

    }
);


/* =========================================================
   PRODUCT GROUP
========================================================= */

const product =
    new THREE.Group();


product.add(
    bottle
);


scene.add(
    product
);


/* =========================================================
   BOTTLE SIZE

   여기 숫자만 바꾸면 병 크기 변경 가능
========================================================= */

product.scale.setScalar(
    1.23
);

/* =========================================================
   HERO BOTTLE Y

   처음 병 꼭대기 = 화면 위에서 230px
========================================================= */

function getHeroBottleY(
    topPx = 230
) {

    const distance =
        camera.position.z;


    const visibleHeight =
        2 *
        Math.tan(
            THREE.MathUtils.degToRad(
                camera.fov /
                2
            )
        ) *
        distance;


    const topY =
        visibleHeight /
        2 -
        (
            topPx /
            window.innerHeight
        ) *
        visibleHeight;


    const bottleHeight =
        H *
        product.scale.y;


    return (
        topY -
        bottleHeight /
        2
    );

}


/* =========================================================
   HERO BOTTLE X

   처음 병 오른쪽 끝 = 오른쪽에서 310px
========================================================= */

function getHeroBottleX(
    rightPx = 310
) {

    const distance =
        camera.position.z;


    const visibleHeight =
        2 *
        Math.tan(
            THREE.MathUtils.degToRad(
                camera.fov /
                2
            )
        ) *
        distance;


    const visibleWidth =
        visibleHeight *
        camera.aspect;


    const box =
        new THREE.Box3()
            .setFromObject(
                bottle
            );


    const bottleWidth =
        (
            box.max.x -
            box.min.x
        ) *
        product.scale.x;


    const bottleRightX =
        visibleWidth /
        2 -
        (
            rightPx /
            window.innerWidth
        ) *
        visibleWidth;


    return (
        bottleRightX -
        bottleWidth /
        2
    );

}


/* =========================================================
   HERO START POSITION
========================================================= */

let heroStartY =
    getHeroBottleY(
        230
    );


let heroStartX =
    getHeroBottleX(
        310
    );


/* =========================================================
   HALO
========================================================= */

function radialTexture(
    inner,
    mid
) {

    const c =
        document.createElement(
            'canvas'
        );


    c.width =
        c.height =
            256;


    const g =
        c.getContext(
            '2d'
        );


    const grad =
        g.createRadialGradient(
            128,
            128,
            0,
            128,
            128,
            128
        );


    grad.addColorStop(
        0,
        inner
    );


    grad.addColorStop(
        0.55,
        mid
    );


    grad.addColorStop(
        1,
        'rgba(150,120,80,0)'
    );


    g.fillStyle =
        grad;


    g.fillRect(
        0,
        0,
        256,
        256
    );


    const texture =
        new THREE.CanvasTexture(
            c
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

}


const halo =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            5.2,
            5.2
        ),

        new THREE.MeshBasicMaterial({

            map:
                radialTexture(
                    'rgba(0,150,105,.75)',
                    'rgba(0,90,65,.20)'
                ),

            transparent:
                true,

            depthWrite:
                false,

            toneMapped:
                false

        })

    );


halo.position.z =
    -1.6;


product.add(
    halo
);


/* =========================================================
   MATH HELPERS
========================================================= */

function clamp01(
    value
) {

    return Math.min(
        1,
        Math.max(
            0,
            value
        )
    );

}


function ease(
    value
) {

    const t =
        clamp01(
            value
        );


    return (
        t *
        t *
        (
            3 -
            2 *
            t
        )
    );

}


function lerp(
    from,
    to,
    amount
) {

    return (
        from +
        (
            to -
            from
        ) *
        amount
    );

}


/* =========================================================
   SECTION SCROLL POINT

   각 글자 섹션이 화면 중앙 근처에 왔을 때
   병도 해당 위치에 도착하도록 계산
========================================================= */

function getScrollPoint(
    selector,
    viewportRatio = 0.45
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {
        return 0;
    }


    return (
        element.offsetTop -
        window.innerHeight *
        viewportRatio
    );

}


/* =========================================================
   SCENE POINTS
========================================================= */

let scrollPoints = {

    start:
        0,

    freshness:
        0,

    fermentation:
        0,

    health:
        0,

    design:
        0,

    landing:
        0

};


function updateScrollPoints() {

    scrollPoints.start =
        0;


    scrollPoints.freshness =
        getScrollPoint(
            '#product_freshness',
            0.42
        );


    scrollPoints.fermentation =
        getScrollPoint(
            '#product_fermentation',
            0.40
        );


    scrollPoints.health =
        getScrollPoint(
            '#product_health',
            0.40
        );


    scrollPoints.design =
        getScrollPoint(
            '#product_design',
            0.40
        );


    scrollPoints.landing =
        getScrollPoint(
            '#more_products',
            0.72
        );

}


/* =========================================================
   TARGET

   병의 현재 목표 위치
========================================================= */

const target = {

    rotY:
        0,

    rotX:
        0.06,

    rotZ:
        -0.04,

    posX:
        heroStartX,

    posY:
        heroStartY,

    camZ:
        5.9

};


const current = {
    ...target
};


/* =========================================================
   BOTTLE SCROLL STORY

   01 START
      오른쪽 위

   02 FRESHNESS
      왼쪽 / -18도

   03 DUAL FERMENTED
      중앙 통과

   04 HEALTHY
      오른쪽 / +18도

   05 INNOVATIVE
      왼쪽 / 정면 착지
========================================================= */


function updateBottleStory() {

    const scroll =
        window.scrollY;


    /* 병은 항상 표시 */
    if (canvas) {
        canvas.style.opacity = '1';
    }


    const s0 =
        scrollPoints.start;

    const s1 =
        scrollPoints.freshness;

    const s2 =
        scrollPoints.fermentation;

    const s3 =
        scrollPoints.health;

    const s4 =
        scrollPoints.design;


    /* =====================================================
       01. START → FRESHNESS

       오른쪽 위에서 시작
       왼쪽 FRESHNESS로 내려옴

       최종 기울기 : -18도
    ===================================================== */

    if (
        scroll <= s1
    ) {

        const t =
            ease(
                (
                    scroll -
                    s0
                ) /
                Math.max(
                    1,
                    s1 -
                    s0
                )
            );


        target.posX =
            lerp(
                heroStartX,
                -1.20,
                t
            );


        target.posY =
            lerp(
                heroStartY,
                0.03,
                t
            );


        target.rotY =
            lerp(
                0,
                Math.PI * 2,
                t
            );


        target.rotX =
            lerp(
                0.06,
                0.02,
                t
            );


        target.rotZ =
            lerp(
                -0.04,
                THREE.MathUtils.degToRad(-18),
                t
            );


        target.camZ =
            5.9;


        return;

    }


    /* =====================================================
       02. FRESHNESS → DUAL FERMENTED

       왼쪽에서 중앙으로 이동

       ★ 기존 가운데 통과 기능 유지
    ===================================================== */

    if (
        scroll <= s2
    ) {

        const t =
            ease(
                (
                    scroll -
                    s1
                ) /
                Math.max(
                    1,
                    s2 -
                    s1
                )
            );


        target.posX =
            lerp(
                -1.20,
                0,
                t
            );


        target.posY =
            lerp(
                0.03,
                -0.05,
                t
            );


        target.rotY =
            lerp(
                Math.PI * 2,
                Math.PI * 4,
                t
            );


        target.rotX =
            lerp(
                0.02,
                -0.04,
                t
            );


        target.rotZ =
            lerp(
                THREE.MathUtils.degToRad(-18),
                0.07,
                t
            );


        target.camZ =
            lerp(
                5.9,
                6.15,
                t
            );


        return;

    }


    /* =====================================================
       03. DUAL FERMENTED → HEALTHY

       중앙에서 오른쪽으로 이동

       HEALTHY 도착:
       +18도
    ===================================================== */

    if (
        scroll <= s3
    ) {

        const t =
            ease(
                (
                    scroll -
                    s2
                ) /
                Math.max(
                    1,
                    s3 -
                    s2
                )
            );


        target.posX =
            lerp(
                0,
                0.78,
                t
            );


        target.posY =
            lerp(
                -0.05,
                0.02,
                t
            );


        target.rotY =
            lerp(
                Math.PI * 4,
                Math.PI * 6,
                t
            );


        target.rotX =
            lerp(
                -0.04,
                0.03,
                t
            );


        target.rotZ =
            lerp(
                0.07,
                THREE.MathUtils.degToRad(18),
                t
            );


        target.camZ =
            lerp(
                6.15,
                5.95,
                t
            );


        return;

    }


    /* =====================================================
       04. HEALTHY → INNOVATIVE DESIGN

       오른쪽에서 다시 왼쪽으로 이동

       +18도에서
       마지막 0도로 정면 착지
    ===================================================== */

    if (
        scroll <= s4
    ) {

        const t =
            ease(
                (
                    scroll -
                    s3
                ) /
                Math.max(
                    1,
                    s4 -
                    s3
                )
            );


        target.posX =
            lerp(
                0.78,
                -1.08,
                t
            );


        target.posY =
            lerp(
                0.02,
                0.02,
                t
            );


        target.rotY =
            lerp(
                Math.PI * 6,
                Math.PI * 8,
                t
            );


        target.rotX =
            lerp(
                0.03,
                0,
                t
            );


        target.rotZ =
            lerp(
                THREE.MathUtils.degToRad(18),
                0,
                t
            );


        target.camZ =
            lerp(
                5.95,
                5.9,
                t
            );


        return;

    }


    /* =====================================================
       05. INNOVATIVE DESIGN 이후

       ★ 마지막 위치에서 완전히 착지
       ★ 회전 0도
       ★ 병 사라지지 않음
       ★ MORE PRODUCTS fade 없음
    ===================================================== */

    target.posX =
        -1.08;


    target.posY =
        0.02;


    target.rotY =
        Math.PI * 8;


    target.rotX =
        0;


    target.rotZ =
        0;


    target.camZ =
        5.9;


    if (canvas) {

        canvas.style.opacity =
            '1';

    }


    return;

}


/* =========================================================
   SCROLL
========================================================= */

function onScroll() {

    updateBottleStory();


    if (hint) {

        hint.style.opacity =
            window.scrollY >
                20

                ? 0

                : 1;

    }

}


window.addEventListener(

    'scroll',

    onScroll,

    {
        passive:
            true
    }

);


/* =========================================================
   SECTION OBSERVER
========================================================= */

const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(
                entry => {

                    entry.target
                        .classList
                        .toggle(
                            'in',
                            entry.isIntersecting
                        );

                }
            );

        },

        {
            threshold:
                0.25
        }

    );


document
    .querySelectorAll(
        'section'
    )
    .forEach(
        section => {

            observer.observe(
                section
            );

        }
    );


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(

    'resize',

    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        heroStartY =
            getHeroBottleY(
                230
            );


        heroStartX =
            getHeroBottleX(
                310
            );


        updateScrollPoints();


        onScroll();

    }

);


/* =========================================================
   THREE.JS ANIMATION
========================================================= */

const clock =
    new THREE.Clock();


/*
    숫자가 클수록
    병이 목표 위치를 더 빠르게 따라감

    현재는 기존 느낌을 유지하기 위해
    0.07 사용
*/

const LERP =
    0.07;


function tick() {

    const time =
        clock
            .getElapsedTime();


    /* =====================================================
       목표 위치 / 회전을 부드럽게 따라가기
    ===================================================== */

    for (
        const key in target
    ) {

        current[key] +=
            (
                target[key] -
                current[key]
            ) *
            LERP;

    }


    /* =====================================================
       BOTTLE ROTATION
    ===================================================== */

    bottle.rotation.y =
        current.rotY;


    bottle.rotation.x =
        current.rotX;


    bottle.rotation.z =
        current.rotZ;


    /* =====================================================
       BOTTLE POSITION
    ===================================================== */

    product.position.x =
        current.posX;


    /*
        아주 미세하게 떠 있는 움직임
    */

    product.position.y =
        current.posY +
        Math.sin(
            time *
            0.7
        ) *
        0.018;


    /* =====================================================
       CAMERA
    ===================================================== */

    camera.position.z =
        current.camZ;


    camera.lookAt(
        current.posX *
        0.12,
        0,
        0
    );


    /* =====================================================
       RENDER
    ===================================================== */

    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        tick
    );

}


/* =========================================================
   START
========================================================= */

updateScrollPoints();


onScroll();


Object.assign(
    current,
    target
);


tick();


/* =========================================================
   LOADER OFF
========================================================= */

requestAnimationFrame(
    () => {

        const loader =
            document.getElementById(
                'loader'
            );


        if (loader) {

            loader
                .classList
                .add(
                    'hidden'
                );

        }

    }
);