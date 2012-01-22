/**
 * More configuration options at:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
({
    appDir : "../src",
    baseUrl: "./",
    dir : "../dist",
    paths : {
        "Trinity/Classify": "Classify"
    },
    /* namespace : "Trinity", */

    modules: [{
        name: "Trinity/Classify",
        include: [
            "Classify.Abstract",
            "Classify.Interface",
            "Classify.Singleton"
        ]
    }],

    optimize: "none",
    uglify: {
        beautify: false,
        unsafe : true
    },
    findNestedDependencies : true
})