import React from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n';

const MultiLanguageDemo: React.FC = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4">
            {t('welcome')}
          </h1>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <button
            onClick={toggleLanguage}
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {t('switchLanguage')}
          </button>
        </div>

        <main className="space-y-6">
          <section className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              {t('content.title')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('content.paragraph')}
            </p>
            <button className="bg-indigo-400 text-white px-4 py-2 rounded hover:bg-indigo-500 transition-colors">
              {t('content.button')}
            </button>
          </section>
        </main>

        <footer className="mt-8 text-center text-gray-600">
          <p>{t('footer.text')}: {i18n.language.toUpperCase()}</p>
        </footer>
      </div>
    </div>
  );
};

export default MultiLanguageDemo; 