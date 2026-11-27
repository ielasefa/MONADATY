export const changePasswordCopy = {
  ar: {
    eyebrow: "أمان الحساب", title: "تغيير كلمة المرور", intro: "أدخل كلمة المرور الحالية، ثم اختر كلمة مرور جديدة لحساب الإدارة.",
    formTitle: "بيانات الدخول", formIntro: "املأ الحقول الثلاثة لحفظ التغيير.", current: "كلمة المرور الحالية", next: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور الجديدة",
    currentPlaceholder: "كلمة المرور التي تستعملها حاليًا", nextPlaceholder: "أدخل كلمة مرور جديدة", confirmPlaceholder: "أعد كتابة كلمة المرور الجديدة",
    minimum: "12 حرفًا على الأقل", matching: "كلمتا المرور متطابقتان", show: "إظهار", hide: "إخفاء", save: "حفظ كلمة المرور", saving: "جارٍ الحفظ…",
    required: "أدخل كلمة المرور الحالية.", tooShort: "يجب أن تتكون كلمة المرور الجديدة من 12 حرفًا على الأقل.", mismatch: "تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة.", wrongCurrent: "كلمة المرور الحالية غير صحيحة.",
    success: "تم تغيير كلمة المرور بنجاح.", server: "تعذّر حفظ التغيير. حاول مرة أخرى.", network: "تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.", rate: "محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.", session: "انتهت جلسة الدخول. سجّل الدخول مجددًا للمتابعة.",
    back: "العودة إلى المتجر", signIn: "تسجيل الدخول", account: "إدارة موناداتي", noteTitle: "دخولك، بكلمة مرور جديدة", note: "بعد حفظ التغيير، استعمل كلمة المرور الجديدة في تسجيل الدخول إلى حسابك.",
  },
  fr: {
    eyebrow: "Sécurité du compte", title: "Changer de mot de passe", intro: "Saisissez votre mot de passe actuel, puis choisissez un nouveau mot de passe pour votre compte administrateur.",
    formTitle: "Vos identifiants", formIntro: "Renseignez les trois champs pour enregistrer la modification.", current: "Mot de passe actuel", next: "Nouveau mot de passe", confirm: "Confirmer le nouveau mot de passe",
    currentPlaceholder: "Votre mot de passe actuel", nextPlaceholder: "Choisissez un nouveau mot de passe", confirmPlaceholder: "Saisissez à nouveau le nouveau mot de passe",
    minimum: "12 caractères minimum", matching: "Les mots de passe correspondent", show: "Afficher", hide: "Masquer", save: "Enregistrer le mot de passe", saving: "Enregistrement…",
    required: "Saisissez votre mot de passe actuel.", tooShort: "Le nouveau mot de passe doit contenir au moins 12 caractères.", mismatch: "La confirmation ne correspond pas au nouveau mot de passe.", wrongCurrent: "Le mot de passe actuel est incorrect.",
    success: "Votre mot de passe a été modifié.", server: "Impossible d’enregistrer la modification. Réessayez.", network: "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.", rate: "Trop de tentatives. Patientez une minute avant de réessayer.", session: "Votre session a expiré. Reconnectez-vous pour continuer.",
    back: "Revenir à la boutique", signIn: "Se connecter", account: "Administration MONADATY", noteTitle: "Votre prochain accès", note: "Une fois la modification enregistrée, utilisez votre nouveau mot de passe pour vous connecter à votre compte.",
  },
  en: {
    eyebrow: "Account security", title: "Change your password", intro: "Enter your current password, then choose a new password for your administrator account.",
    formTitle: "Your sign-in details", formIntro: "Complete all three fields to save your changes.", current: "Current password", next: "New password", confirm: "Confirm new password",
    currentPlaceholder: "Your current password", nextPlaceholder: "Choose a new password", confirmPlaceholder: "Enter your new password again",
    minimum: "At least 12 characters", matching: "Passwords match", show: "Show", hide: "Hide", save: "Save password", saving: "Saving…",
    required: "Enter your current password.", tooShort: "Your new password must contain at least 12 characters.", mismatch: "The confirmation does not match your new password.", wrongCurrent: "Your current password is incorrect.",
    success: "Your password has been changed.", server: "Could not save your changes. Please try again.", network: "Could not reach the server. Check your connection and try again.", rate: "Too many attempts. Wait a minute before trying again.", session: "Your session has expired. Sign in again to continue.",
    back: "Back to storefront", signIn: "Sign in", account: "MONADATY administration", noteTitle: "Your next sign-in", note: "After saving your changes, use your new password to sign in to your account.",
  },
} as const;
