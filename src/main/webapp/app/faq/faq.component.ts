import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-faq',
  templateUrl: './faq.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, NgbModule],
})
export default class FaqComponent {
  isOpen: boolean[] = [true, false, false, false, false, false];

  faqs = [
    {
      question: 'What is Singles Meetup?',
      answer: 'Singles Meetup is a platform designed to bring together singles in a fun, safe, and engaging environment. We organize various events and activities to help you meet new people and potentially find your special someone.'
    },
    {
      question: 'How do I join an event?',
      answer: 'Simply browse through our upcoming events, find one that interests you, and click the "Book Your Spot" button. You\'ll need to be logged in to complete the booking process.'
    },
    {
      question: 'Are the events safe?',
      answer: 'Yes, we take safety very seriously. All our events are organized in public venues, and we have staff present to ensure everyone feels comfortable and secure. We also verify all member profiles to maintain a safe community.'
    },
    {
      question: 'What types of events do you organize?',
      answer: 'We organize a variety of events including speed dating, social mixers, themed parties, outdoor activities, and more. Each event is designed to create a comfortable environment for singles to meet and connect.'
    },
    {
      question: 'Can I get a refund if I can\'t attend?',
      answer: 'Yes, we offer refunds up to 24 hours before the event. Please check our cancellation policy for specific details about refund eligibility and process.'
    },
    {
      question: 'How do I create a profile?',
      answer: 'Creating a profile is easy! Just click on the "Sign Up" button, fill in your details, and upload a photo. Make sure to complete your profile with interesting information about yourself to attract potential matches.'
    }
  ];

  toggleAccordion(index: number): void {
    // Close all other panels
    this.isOpen = this.isOpen.map((_, i) => i === index ? !this.isOpen[i] : false);
  }
} 