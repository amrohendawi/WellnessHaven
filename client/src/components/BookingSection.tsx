import { useState, useEffect } from 'react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader,
  DialogFooter 
} from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import type { ServiceDisplay } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Service categories for booking (matching categories in the database)
const serviceCategories = [
  {
    id: 'beauty',
    nameKey: 'beautyServices',
    descriptionKey: 'beautyServicesDesc'
  },
  {
    id: 'skincare',
    nameKey: 'skincareTreatments', 
    descriptionKey: 'skincareTreatmentsDesc'
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
  const [selectedService, setSelectedService] = useState<ServiceDisplay | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  // Fetch services from API
  const { data: services = [], isLoading } = useQuery<ServiceDisplay[]>({
    queryKey: ['/api/services'],
  });

  // Filter services by selected category
  const filteredServices = selectedCategory 
    ? services.filter(service => service.category === selectedCategory)
    : [];

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

  // When category is selected, open the service selection modal if there are services
  useEffect(() => {
    if (selectedCategory) {
      const timer = setTimeout(() => {
        setServiceModalOpen(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedCategory]);

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

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (!selectedService || selectedService.category !== categoryId) {
      setSelectedService(null);
    }
  };

  // Handle service selection
  const handleServiceSelect = (service: ServiceDisplay) => {
    setSelectedService(service);
    setServiceModalOpen(false);
  };

  // Toast notification setup
  const { toast } = useToast();
  
  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return;
    }
    
    // Prepare booking data
    const bookingData = {
      ...data,
      service: selectedService.slug,
      serviceId: selectedService.id,
      serviceName: selectedService.name[language] || selectedService.name.en,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      price: selectedService.price,
      duration: selectedService.duration
    };
    
    console.log('Booking submitted:', bookingData);
    
    try {
      // Submit to server
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success toast notification
        toast({
          title: t('bookingSuccess'),
          description: t('bookingConfirmation'),
          duration: 5000,
        });
        
        // Reset form
        form.reset();
        setSelectedService(null);
        setSelectedDate(undefined);
        setSelectedTime(null);
        setBookingStep(1);
      } else {
        // Show error toast
        toast({
          title: t('bookingError'),
          description: result.message || t('bookingErrorMsg'),
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      // Show error toast
      toast({
        title: t('bookingError'),
        description: t('bookingErrorMsg'),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <section id="booking" className="py-16 bg-pink-light">
      {/* Add Toaster component for toast notifications */}
      <Toaster />
      
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
              onClick={() => selectedService && setBookingStep(2)}
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
                    onClick={() => handleCategorySelect(category.id)}
                    className={`border rounded-lg p-4 hover:border-pink cursor-pointer ${
                      selectedCategory === category.id ? 'border-pink-dark bg-pink-light' : ''
                    }`}
                  >
                    <h4 className="font-medium mb-2">{t(category.nameKey)}</h4>
                    <div className="text-sm text-gray-600">{t(category.descriptionKey)}</div>
                  </div>
                ))}
              </div>
              
              {/* Button to view all services directly */}
              <div className="text-center mb-6">
                <Button
                  onClick={() => setServiceModalOpen(true)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  {t('viewAllServices')}
                </Button>
              </div>
              
              {/* Selected Service Display */}
              {selectedService && (
                <div className="bg-pink-lightest border border-pink rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{t('selectedService')}</h4>
                      <p className="text-md font-semibold text-pink-dark">
                        {selectedService.name[language] || selectedService.name.en}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedService.description[language] || selectedService.description.en}
                      </p>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-gray-700 mr-4">
                          <i className="far fa-clock mr-1"></i> {selectedService.duration} {t('minutes')}
                        </span>
                        <span className="text-gray-700">
                          <i className="far fa-money-bill-alt mr-1"></i> {selectedService.price} €
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setServiceModalOpen(true)}
                      className="text-pink-dark hover:text-pink-darker"
                    >
                      {t('change')}
                    </Button>
                  </div>
                </div>
              )}
              
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
                  disabled={!selectedService}
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
                        <FormLabel>{t('formName')} <span className="text-pink">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder={t('yourName')} {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formEmail')} <span className="text-pink">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('yourEmail')} {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('formPhone')} <span className="text-pink">*</span></FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('yourPhone')} {...field} required />
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
                          {selectedService && (selectedService.name[language] || selectedService.name.en)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-gray-600">{t('duration')}:</span>
                        <span className="font-medium">
                          {selectedService && `${selectedService.duration} ${t('minutes')}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-gray-600">{t('price')}:</span>
                        <span className="font-medium">
                          {selectedService && `${selectedService.price} €`}
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
                  
                  <div className="mt-8">
                    <div className="flex justify-between mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        {t('back')}
                      </Button>
                    </div>
                    
                    <div className="border-t pt-6">
                      <Button
                        type="submit"
                        className="w-full py-6 bg-pink hover:bg-pink-dark shadow-lg transition-all text-white text-lg font-bold relative"
                        disabled={!form.watch('name') || !form.watch('email') || !form.watch('phone')}
                      >
                        {t('confirmBooking')} <i className="ml-2 fas fa-check"></i>
                      </Button>
                      
                      {/* Required fields note */}
                      <div className="text-center mt-2 text-xs text-gray-500">
                        <span className="text-pink">*</span> {t('requiredFields')}
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>

      {/* Service Selection Modal */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('selectSpecificService')}</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink"></div>
            </div>
          ) : services && services.length > 0 ? (
            <div className="space-y-4">
              {/* Category filter buttons */}
              <div className="flex flex-wrap gap-2 px-1">
                <Button 
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs"
                >
                  {t('allServices')}
                </Button>
                
                {services
                  .map(s => s.category)
                  .filter((cat, i, arr) => arr.indexOf(cat) === i)
                  .map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {t(`${category}Services`) || category}
                    </Button>
                  ))
                }
              </div>
            
              {/* Service list */}
              <div className="max-h-[400px] overflow-y-auto">
                {(selectedCategory ? filteredServices : services).map(service => (
                  <div 
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="p-3 mb-2 border rounded-md hover:bg-pink-lightest cursor-pointer"
                  >
                    <div className="flex items-start">
                      {service.imageUrl && (
                        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-3">
                          <img 
                            src={service.imageUrl} 
                            alt={service.name[language] || service.name.en} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-pink-dark">
                          {service.name[language] || service.name.en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {service.description[language] || service.description.en}
                        </p>
                        <div className="flex text-sm text-gray-500">
                          <span className="mr-3">{service.duration} {t('minutes')}</span>
                          <span>{service.price} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              {t('noServicesAvailable')}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceModalOpen(false)}>
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default BookingSection;