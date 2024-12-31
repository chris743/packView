from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management.base import BaseCommand
import atexit
from sheduled_tasks.tasks.upload_orders import process_newest_file
from sheduled_tasks.tasks.upload_inventory import connect_to_email, download_reports, combine_and_import_reports

class Command(BaseCommand):
    help = "Runs the APScheduler to execute periodic tasks"

    def handle(self, *args, **kwargs):
        scheduler = BackgroundScheduler()

        # Schedule the process_newest_file function
        scheduler.add_job(process_newest_file, 'interval', minutes=120)

        # Schedule the email processing function
        def process_bin_inventory():
            mail = connect_to_email()
            if mail:
                download_reports(mail)
                combine_and_import_reports()

        scheduler.add_job(process_bin_inventory, 'interval', minutes=1)

        # Start the scheduler
        self.stdout.write("Starting the scheduler...")
        scheduler.start()

        # Ensure scheduler shuts down properly on exit
        atexit.register(lambda: scheduler.shutdown(wait=False))

        try:
            self.stdout.write("Scheduler is running. Press Ctrl+C to exit.")
            while True:
                pass
        except (KeyboardInterrupt, SystemExit):
            self.stdout.write("Shutting down scheduler...")
