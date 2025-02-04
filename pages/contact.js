'use client';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import Head from 'next/head';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Please Enter Your Name' }),
  email: z.string().email({ message: 'Please Enter a Valid Email Address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values) => {
    setLoading(true);

    const mailText = `<div style="font-family: 'Montserrat', sans-serif; background-color: #ffffff; color: #333; padding: 40px; max-width: 700px; margin: auto;">
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px !important; }
      h1 { font-size: 24px !important; }
      .divider { margin: 24px 0 !important; }
    }
  </style>

  <div style="padding: 40px;">
    <!-- Header -->
    <h1 style="font-size: 32px; font-weight: 800; color: #000; margin: 0 0 32px; letter-spacing: -0.5px;">
      NEW MESSAGE
    </h1>

    <!-- Sender Info -->
    <div style="margin-bottom: 40px;">
      <p style="font-size: 18px; margin: 0 0 8px; font-weight: 600;">
        From ${values.name}
      </p>
      <p style="font-size: 16px; margin: 0; color: #666;">
        <a href="mailto:${values.email}" style="color: #000; text-decoration: none; border-bottom: 2px solid #000;">
          ${values.email}
        </a>
      </p>
    </div>

    <!-- Message Content -->
    <div style="border-left: 3px solid #000; padding-left: 24px; margin-bottom: 40px;">
      <p style="font-size: 18px; line-height: 1.6; margin: 0; color: #444;">
        ${values.message}
      </p>
    </div>

    <!-- Divider -->
    <div class="divider" style="height: 2px; background: #000; margin: 48px 0;"></div>

    <!-- Reply CTA -->
    <a href="mailto:${values.email}" style="display: block; text-decoration: none; text-align: center;">
      <span style="display: inline-block; font-size: 16px; font-weight: 700; color: #000; padding: 16px 48px; border: 2px solid #000; transition: all 0.3s ease;">
        Reply to ${values.name}
      </span>
    </a>
  </div>

  <!-- Footer -->
  <p style="font-size: 12px; color: #999; text-align: center; margin: 40px 0 0; letter-spacing: 0.5px;">
    Sent via contact form • Do not reply to this automated message
  </p>
</div>`;

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

      if (!response.ok) throw new Error('Failed to send message');

      toast.success('Message sent successfully!');
      form.reset();
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (

    <>

      <Head>

        <title>Contact Us | ASHE™</title>

        <meta name="description" content="Get in touch with ASHE for inquiries, support, and more. We're here to assist you!" />

      </Head>

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

                      placeholder={field === 'name' ? 'Your Name' : 'Your Email'}

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

                className="w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none"

                disabled={loading}

              >

                {loading ? 'sending...' : 'Send Message'}

              </button>

            </form>

          </div>

        </div>

      </Layout>

    </>

  );
}
