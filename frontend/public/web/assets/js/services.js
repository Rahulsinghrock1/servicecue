(function () {
    "use strict";

    // Add Education
    $(document).on('click', '.add-service-btn', function (e) {
        e.preventDefault();

        const newtreatment = `
            <div class="mb-2 add-service-list row align-items-end">
                <div class="col-md-12">
                    <div class="row">
                        <h5 class="mt-1">Add New Treatment</h5>
                        <div class="col-lg-11 col-10">
                            <div class="mb-3">
                                <label class="form-label">Treatment Name</label>
                                <input type="text" class="form-control" placeholder="Enter Treatment Name">
                            </div>
                        </div>
                        <div class="col-lg-1 col-1">
                            <div class="mb-3">
                                <label class="form-label">&nbsp;</label>
                                <a href="javascript:void(0);" class="remove-service-btn p-4 bg-soft-danger btn-icon text-danger rounded d-flex align-items-center justify-content-center">
                                    <i class="ti ti-trash fs-16"></i>
                                </a>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="mb-3">
                                <label class="form-label">Pre Care Instructions</label>
                                <div class="pre-care-editor" style="height: 100px"></div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="mb-3">
                                <label class="form-label">Post Care Instructions</label>
                                <div class="post-care-editor" style="height: 100px"></div>
                            </div>
                        </div>
                        <div class="d-flex mb-3 align-items-center justify-content-end">
                            <button class="btn btn-lg btn-primary save-treatment-btn">Save Treatment</button>
                        </div>
                        <hr>
                    </div>
                </div>
            </div>
        `;

        // Insert before the add button row
        const $newTreatment = $(newtreatment);
        $(this).closest('.add-service-list').before($newTreatment);

        // Initialize Quill editors for the newly added section
        if (typeof Quill !== 'undefined') {
            $newTreatment.find('.pre-care-editor').each(function () {
                new Quill(this, {
                    theme: 'snow'
                });
            });
            $newTreatment.find('.post-care-editor').each(function () {
                new Quill(this, {
                    theme: 'snow'
                });
            });
        } else {
            console.error('Quill library is not loaded.');
        }
    });

    // Remove treatment
    $(document).on('click', '.remove-service-btn', function (e) {
        e.preventDefault();
        $(this).closest('.add-service-list').remove();
    });

    // Save treatment (example handler)
    $(document).on('click', '.save-treatment-btn', function (e) {
        e.preventDefault();
        const $section = $(this).closest('.add-service-list');
        const treatmentName = $section.find('input.form-control').val();
        const preCareContent = $section.find('.pre-care-editor .ql-editor').html();
        const postCareContent = $section.find('.post-care-editor .ql-editor').html();

        if (!treatmentName) {
            alert('Please enter a treatment name.');
            return;
        }

        console.log('Saving treatment:', {
            name: treatmentName,
            preCare: preCareContent,
            postCare: postCareContent
        });
        // Add your save logic here (e.g., AJAX request)
    });

})();