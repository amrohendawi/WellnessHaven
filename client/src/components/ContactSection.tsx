import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { submitContactForm } from '@/lib/api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ContactSection = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    setSubmitting(true);

    try {
      // Submit to server using the API function from our centralized client
      const result = await submitContactForm(data);

      toast({
        title: t('messageSent'),
        description: t('thankYouContact'),
      });

      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('messageFailed'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-beige-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="royal-heading text-3xl md:text-4xl mb-8">{t('contactTitle')}</h2>
          <div className="fancy-divider mb-4">
            <i className="fas fa-envelope fancy-divider-icon text-gold mx-2"></i>
          </div>
        </div>

        <div
          className={`flex flex-col ${dir === 'rtl' ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 max-w-6xl mx-auto`}
        >
          <div className="lg:w-1/2">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 h-64 md:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.754375842194!2d13.43261131581464!3d52.48446647980757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84e3b4e0b1a1b%3A0x6e6f5b6e9b2e5a5f!2sKarl-Marx-Stra%C3%9Fe%2045%2C%2012043%20Berlin%2C%20Germany!5e0!3m2!1sen!2sde!4v1715443380000!5m2!1sen!2sde"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Dubai Rose Location"
              ></iframe>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className={`flex items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`text-gold-dark ${dir === 'ltr' ? 'mr-4' : 'ml-4'} mt-1`}>
                  <i className="fas fa-map-marker-alt text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">{t('address')}</h4>
                  <p className="text-gray-600">{t('contactAddress')}</p>
                </div>
              </div>

              <div className={`flex items-start mb-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`text-gold-dark ${dir === 'ltr' ? 'mr-4' : 'ml-4'} mt-1`}>
                  <i className="fas fa-phone-alt text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">{t('phone')}</h4>
                  <p className="text-gray-600">{t('contactPhone')}</p>
                  <div className="flex mt-2 space-x-2 rtl:space-x-reverse">
                    <a
                      href={'tel:+491784423645'}
                      className="bg-pink-light hover:bg-pink text-gray-800 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      <i className="fas fa-phone-alt mr-1 rtl:ml-1 rtl:mr-0"></i> {t('call')}
                    </a>
                    <a
                      href={`https://wa.me/491784423645`}
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      <i className="fab fa-whatsapp mr-1 rtl:ml-1 rtl:mr-0"></i> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className={`text-gold-dark ${dir === 'ltr' ? 'mr-4' : 'ml-4'} mt-1`}>
                  <i className="fas fa-clock text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium mb-1">{t('hours')}</h4>
                  <p className="text-gray-600">{t('contactHours')}</p>
                  <p className="text-gray-600">{t('closedFriday')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <h3 className="text-xl font-semibold mb-6">{t('sendMessage')}</h3>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formName')}</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formEmail')}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formPhone')}</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formMessage')}</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gold-dark hover:bg-gold text-white"
                    disabled={submitting}
                  >
                    {submitting ? t('sending') : t('formSubmit')}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">{t('connectSocial')}</p>
                <div className="flex justify-center space-x-4 rtl:space-x-reverse mt-3">
                  <a href="#" className="text-gray-400 hover:text-gold-dark transition-colors">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gold-dark transition-colors">
                    <i className="fab fa-facebook text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gold-dark transition-colors">
                    <i className="fab fa-snapchat text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gold-dark transition-colors">
                    <i className="fab fa-tiktok text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
