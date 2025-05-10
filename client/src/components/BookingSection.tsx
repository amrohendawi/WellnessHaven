import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { ar, de, tr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

// Service categories for booking
const serviceCategories = [
  {
    id: 'facial',
    nameKey: 'facialTreatments',
    descriptionKey: 'facialTreatmentsDesc'
  },
  {
    id: 'laser',
    nameKey: 'laserTreatments',
    descriptionKey: 'laserTreatmentsDesc'
  },
  {
    id: 'hair',
    nameKey: 'hairServices',
    descriptionKey: 'hairServicesDesc'
  },
  {
    id: 'beauty',
    nameKey: 'beautyServices',
    descriptionKey: 'beautyServicesDesc'
  }
];

// Available time slots
const timeSlots = [
  '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

const BookingSection = () => {
  const { t } = useTranslation();
  const { language, dir } = useLanguage();
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      vipNumber: '',
    }
  });

  // Get correct date locale based on selected language
  const getDateLocale = () => {
    switch (language) {
      case 'ar': return ar;
      case 'de': return de;
      case 'tr': return tr;
      default: return enUS;
    }
  };

  // Process to next step
  const nextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  // Go back to previous step
  const prevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    console.log('Booking submitted:', {
      ...data,
      serviceCategory: selectedCategory,
      date: selectedDate,
      time: selectedTime,
    });
    // In a real app, this would submit to the server
    alert(t('bookingConfirmation'));
  };

  return (
    <section id="booking" className="py-16 bg-pink-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="royal-heading text-3xl md:text-4xl mb-8">
            {t('bookingTitle')}
          </h2>
          <div className="fancy-divider mb-4">
            <i className="fas fa-calendar-alt fancy-divider-icon text-gold mx-2"></i>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('bookingSubtitle')}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          {/* Booking Steps */}
          <div className="flex border-b">
            <div 
              className={`booking-step flex-1 py-4 text-center border-r border-gray-200 cursor-pointer ${bookingStep === 1 ? 'active' : ''}`}
              onClick={() => setBookingStep(1)}
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${bookingStep === 1 ? 'bg-pink' : 'bg-gray-200'} flex items-center justify-center mb-1`}>
                  <i className={`fas fa-spa ${bookingStep === 1 ? 'text-white' : 'text-gray-500'}`}></i>
                </div>
                <span className="text-sm">1. {t('selectService')}</span>
              </div>
            </div>
            <div 
              className={`booking-step flex-1 py-4 text-center border-r border-gray-200 cursor-pointer ${bookingStep === 2 ? 'active' : ''}`}
              onClick={() => selectedCategory && setBookingStep(2)}
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${bookingStep === 2 ? 'bg-pink' : 'bg-gray-200'} flex items-center justify-center mb-1`}>
                  <i className={`fas fa-calendar-alt ${bookingStep === 2 ? 'text-white' : 'text-gray-500'}`}></i>
                </div>
                <span className="text-sm">2. {t('dateTime')}</span>
              </div>
            </div>
            <div 
              className={`booking-step flex-1 py-4 text-center cursor-pointer ${bookingStep === 3 ? 'active' : ''}`}
              onClick={() => selectedDate && selectedTime && setBookingStep(3)}
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${bookingStep === 3 ? 'bg-pink' : 'bg-gray-200'} flex items-center justify-center mb-1`}>
                  <i className={`fas fa-user ${bookingStep === 3 ? 'text-white' : 'text-gray-500'}`}></i>
                </div>
                <span className="text-sm">3. {t('yourDetails')}</span>
              </div>
            </div>
          </div>
          
          {/* Step 1: Service Selection */}
          {bookingStep === 1 && (
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-4">{t('chooseService')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {serviceCategories.map((category) => (
                  <div 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`border rounded-lg p-4 hover:border-pink cursor-pointer ${
                      selectedCategory === category.id ? 'border-pink-dark bg-pink-light' : ''
                    }`}
                  >
                    <h4 className="font-medium mb-2">{t(category.nameKey)}</h4>
                    <div className="text-sm text-gray-600">{t(category.descriptionKey)}</div>
                  </div>
                ))}
              </div>
              
              {/* VIP Member Section */}
              <div className="bg-beige-light rounded-lg p-4 flex flex-col md:flex-row items-center mb-6">
                <div className={`${dir === 'rtl' ? 'ml-4' : 'mr-4'} text-xl text-gold-dark`}>
                  <i className="fas fa-crown"></i>
                </div>
                <div>
                  <h4 className="font-medium">{t('vipMember')}</h4>
                  <p className="text-sm text-gray-600">{t('enterMembershipNumber')}</p>
                </div>
                <div className="md:ml-auto mt-3 md:mt-0 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder={t('membershipPlaceholder')}
                    className="border rounded-md px-3 py-2 text-sm w-full md:w-40"
                    value={form.watch('vipNumber')}
                    onChange={(e) => form.setValue('vipNumber', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  {t('cancel')}
                </Button>
                <Button
                  disabled={!selectedCategory}
                  onClick={nextStep}
                  className="bg-pink hover:bg-pink-dark text-gray-800"
                >
                  {t('continue')}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Date & Time Selection */}
          {bookingStep === 2 && (
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-4">{t('selectDateTime')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <h4 className="font-medium mb-3">{t('selectDate')}</h4>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: getDateLocale() })
                        ) : (
                          <span>{t('pickDate')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={getDateLocale()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Time Selection */}
                <div>
                  <h4 className="font-medium mb-3">{t('selectTime')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        className={cn(
                          "justify-center", 
                          selectedTime === time && "bg-pink text-gray-800 border-pink"
                        )}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  {t('back')}
                </Button>
                <Button
                  disabled={!selectedDate || !selectedTime}
                  onClick={nextStep}
                  className="bg-pink hover:bg-pink-dark text-gray-800"
                >
                  {t('continue')}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Personal Details */}
          {bookingStep === 3 && (
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-4">{t('enterDetails')}</h3>
              
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
                  
                  {/* Booking Summary */}
                  <div className="bg-beige-light p-4 rounded-lg my-6">
                    <h4 className="font-medium mb-2">{t('bookingSummary')}</h4>
                    <div className="text-sm">
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-gray-600">{t('service')}:</span>
                        <span className="font-medium">
                          {selectedCategory && t(`${selectedCategory}Service`)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-gray-600">{t('date')}:</span>
                        <span className="font-medium">
                          {selectedDate && format(selectedDate, "PPP", { locale: getDateLocale() })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-gray-600">{t('time')}:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      {form.watch('vipNumber') && (
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-gray-600">{t('vipDiscount')}:</span>
                          <span className="font-medium text-gold-dark">{t('applied')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      {t('back')}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gold-dark hover:bg-gold text-white"
                    >
                      {t('confirmBooking')}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
