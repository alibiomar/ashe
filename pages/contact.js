'use client';
import Layout from '../components/Layout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Please Enter Your Name' }),
  email: z.string().email({ message: 'Please Enter a Valid Email Address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

export default function ContactForm() {
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values) => {
    const mailText = `Name: ${values.name}\nEmail: ${values.email}\nMessage: ${values.message}`;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          subject: 'New Contact Us Form',
          text: mailText,
        }),
      });

      const data = await response.json();
      data.messageId 
        ? toast.success('Message sent successfully!')
        : toast.error('Failed to send message.');
    } catch (error) {
      toast.error('An error occurred while sending your message.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-2xl mx-4 bg-white p-12 rounded-none shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12 tracking-tight">
            CONTACT US
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {['name', 'email', 'message'].map((field) => (
              <div key={field} className="relative">
                {field !== 'message' ? (
                  <input
                    {...form.register(field)}
                    placeholder={
                      field === 'name' ? 'Your Name' : 'Your Email'
                    }
                    className={`w-full px-0 py-3 border-b-2 border-gray-300 
                      focus:border-black focus:ring-0 bg-transparent
                      placeholder-gray-400 text-lg font-medium
                      transition-all duration-200 rounded-none`}
                  />
                ) : (
                  <textarea
                    {...form.register(field)}
                    placeholder="Your Message"
                    className={`w-full px-0 py-3 border-b-2 border-gray-300 
                      focus:border-black focus:ring-0 bg-transparent
                      placeholder-gray-400 text-lg font-medium resize-none
                      transition-all duration-200 rounded-none h-32`}
                  />
                )}
                {form.formState.errors[field] && (
                  <p className="absolute -bottom-6 left-0 text-red-600 text-sm font-medium">
                    {form.formState.errors[field].message}
                  </p>
                )}
              </div>
            ))}
            <button
              type="submit"
              className={`w-full py-4 bg-black text-white font-bold text-lg
                uppercase tracking-wide hover:bg-gray-800 transition-colors
                duration-200 rounded-none`}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}