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
    const mailText = `<div style="font-family: 'Montserrat', sans-serif; background-color: #ffffff; color: #333; padding: 40px; max-width: 700px; margin: auto;">

  <!-- Mobile Responsiveness -->
  <style>
    @media only screen and (max-width: 600px) {
      .main-card {
        padding: 20px !important;
      }
      .quote-box {
        padding: 20px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      p, span {
        font-size: 16px !important;
      }
      .contact-info {
        padding: 20px !important;
      }
      .reply-button {
        width: 100% !important;
      }
    }
  </style>

  <!-- Main Card -->
  <div class="main-card" style="background-color: #fff; padding: 40px; border-radius: 8px; border: 1px solid #ddd;">
    
    <!-- Header -->
    <h1 style="font-size: 28px; font-weight: 700; color: #000; text-align: left; margin-bottom: 20px; letter-spacing: 1px;">
      NEW MESSAGE
    </h1>

    <!-- Message Section -->
    <p style="font-size: 18px; margin-bottom: 20px;">
      Message received from <strong>${values.name}</strong>:
    </p>
    
    <div class="quote-box" style="font-style: italic; background-color: #f9f9f9; padding: 30px; margin: 30px 0; border-left: 4px solid #000; border-radius: 4px;">
      <p style="font-size: 16px; margin: 0;">“${values.message}”</p>
    </div>

    <!-- Contact Info Section -->
    <div class="contact-info" style="background-color: #f7f7f7; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
      <p style="font-size: 16px; margin: 0 0 10px; font-weight: 700; letter-spacing: 0.5px;">CONTACT DETAILS</p>
      <p style="font-size: 16px; margin: 0;">Name: <strong>${values.name}</strong></p>
      <p style="font-size: 16px; margin: 0;">Email: <a href="mailto:${values.email}" style="color: #000; text-decoration: underline;">${values.email}</a></p>
    </div>

    <!-- "Click to Reply" Button -->
    <div style="text-align: center;">
      <a href="mailto:${values.email}" class="reply-button" style="display: inline-block; background-color: #000; color: #fff; padding: 15px 30px; border-radius: 6px; text-decoration: none; font-weight: 700; letter-spacing: 1px;">
        REPLY
      </a>
    </div>
  </div>

  <!-- Footer -->
  <p style="font-size: 14px; color: #777; text-align: left; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
    You can reply directly to <strong>${values.name}</strong> using the button above.
  </p>
</div>

`;
  
    try {  
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email, // Use user's email from form
          subject: 'New Contact Us Form',
          text: mailText,
        }),
      });
  
      if (!response.ok) throw new Error('Failed to send message');
      
      toast.success('Message sent successfully!');
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred');
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
                  className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none "
                  disabled={loading}
                >
                                    {loading ? <div className="loading"></div> : 'Send Message'}

            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}