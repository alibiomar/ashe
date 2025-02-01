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
    const mailText = `<div style="font-family: 'Montserrat', sans-serif; background-color: #f7f7f7; color: #333; padding: 40px; max-width: 700px; margin: auto; border-radius: 12px;">

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
  <div class="main-card" style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
    
    <!-- Header -->
    <h1 style="font-size: 26px; font-weight: 700; color: #0abab5; text-align: left; margin-bottom: 30px; border-bottom: 2px solid #eaeaea; padding-bottom: 15px;">
      New Message Received
    </h1>

    <!-- Message Section -->
    <p style="font-size: 18px; color: #444; margin-bottom: 20px;">
      A message has been received from <strong style="color: #333;">${values.name}</strong>:
    </p>
    
    <div class="quote-box" style="font-style: italic; background-color: #f9f9fc; padding: 30px; margin: 30px 0; border-left: 5px solid #0abab5; border-radius: 4px; color: #555;">
      <p style="font-size: 16px;">“${values.message}”</p>
    </div>


    <!-- Contact Info Section -->
    <div class="contact-info" style="background-color: #f7f8fa; padding: 30px; margin-top: 40px; border-radius: 8px; text-align: left; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
      <p style="font-size: 16px; color: #444; margin-bottom: 10px;"><strong>Contact Details:</strong></p>
      <p style="font-size: 16px; color: #444;">Name: <strong>${values.name}</strong></p>
      <p style="font-size: 16px; color: #444;">Email: <a href="mailto:${values.email}" style="color: #0abab5; text-decoration: none;">${values.email}</a></p>
    </div>

    <!-- "Click to Reply" Button -->
    <div style="text-align: center; margin-top: 40px;">
      <a href="mailto:${values.email}" style="display: inline-block; background-color: #0abab5; color: #fff; padding: 15px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; letter-spacing: 1px; transition: background-color 0.3s;" class="reply-button">
        Click to Reply
      </a>
    </div>
  </div>

  <!-- Footer -->
  <p style="font-size: 14px; color: #999; text-align: left; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
    You can reply directly to <strong>${values.name}</strong> by clicking the button above.
  </p>
</div>
`;
  
    try {  
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'contact@ashe.tn',
          subject: 'New Contact Us Form',
          text: mailText,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success('Message sent successfully!');
      } else {
        toast.error('Failed to send message.');
      }
    } catch (error) {
      console.error('Error:', error);
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