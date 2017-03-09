import I18n from 'react-native-i18n';
import deepmerge from 'deepmerge';
export default function setI18n(translations = {}) {
    I18n.fallbacks = true;
    I18n.translations = deepmerge({
        en: {
            next: 'Next',
            cancel: 'Cancel',
            library: 'Library',
            photo: 'Photo',
            unauthorizedHeaderText: 'Grant access to your photos',
            unauthorizedSubtitle: 'This will make it possible for this app to select, edit and upload photos from the camera roll.',
            unauthorizedSettingsButtonText: 'Activate access to library',
            edit: 'Edit',
            share: 'Share'
        },
        sv: {
            next: 'Nästa',
            cancel: 'Avbryt',
            library: 'Bibliotek',
            photo: 'Foto',
            unauthorizedHeaderText: 'Ge åtkomst till dina foton',
            unauthorizedSubtitle: 'Detta gör det möjligt för denna app att välja, redigera och ladda upp foton från kamerarullen.',
            unauthorizedSettingsButtonText: 'Aktivera åtkomst till bibliotektet',
            edit: 'Redigera',
            share: 'Dela'
        }
    }, translations);
}