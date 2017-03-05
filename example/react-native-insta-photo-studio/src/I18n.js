import I18n from 'react-native-i18n';
import deepmerge from 'deepmerge';
export default function setI18n(translations = {}) {
    I18n.fallbacks = true;
    I18n.translations = deepmerge({
        en: {
            next: 'Next',
            cancel: 'Cancel',
            library : 'Library',
            photo : 'Photo'
        },
        sv: {
            next: 'Nästa',
            cancel: 'Avbryt',
            library : 'Bibliotek',
            photo : 'Foto'
        }
    }, translations);
}