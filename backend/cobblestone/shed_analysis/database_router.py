class BreezeRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'scanner':
            return 'scanner_db'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'scanner':
            return 'scanner_db'
        return None
