const rnpmConfig = require('./local-cli/core/config');
const link = require('./local-cli/link/link.js');
const fs = require('fs');
const xcode = require('xcode');
const path = require('path');
const getPlist = require('./local-cli/link/ios/getPlist');
const getPlistPath = require('./local-cli/link/ios/getPlistPath');
const plistParser = require('plist');

const config = {
    getProjectConfig: rnpmConfig.getProjectConfig,
    getDependencyConfig: rnpmConfig.getDependencyConfig,
};

link.func([], config);

const projectConfig = config.getProjectConfig(path.join(process.cwd(), '../../'));
const project = xcode.project(projectConfig.ios.pbxprojPath).parseSync();
const plist = getPlist(project, projectConfig.ios.sourceDir);
plist.NSPhotoLibraryUsageDescription = 'Using photo library to select pictures';
plist.NSMicrophoneUsageDescription = 'Using microphone to record videos in app';
plist.NSCameraUsageDescription = 'Using camera to take photos in app';

fs.writeFileSync(
    getPlistPath(project, projectConfig.ios.sourceDir),
    plistParser.build(plist)
);

//Link extra iOS dependencies:
const reactNativeFolder = path.join(process.cwd(), '../react-native');

//ART:
const linkRNExtraLibrary = (pathFromRN, xprojName, libraryName) => {
    const folder = path.join(reactNativeFolder, pathFromRN);
    const proj = {
        sourceDir: folder,
        folder: folder,
        pbxprojPath: `${folder}/${xprojName}/project.pbxproj`,
        projectPath: `${folder}/${xprojName}`,
        projectName: xprojName,
        libraryFolder: 'Libraries',
        sharedLibraries: [],
        plist: []
    };

    link.linkDependencyIOS(projectConfig.ios, {
        name: libraryName,
        config: {
            ios: proj
        }
    });
};

linkRNExtraLibrary('./Libraries/ART', 'ART.xcodeproj', 'ART');
linkRNExtraLibrary('./Libraries/CameraRoll', 'RCTCameraRoll.xcodeproj', 'RCTCameraRoll');
linkRNExtraLibrary('./Libraries/NativeAnimation', 'RCTAnimation.xcodeproj', 'RCTAnimation');
